import type { Transaction, TransactionDetail } from "@/src/types/transactions";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Transactions() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterText, setFilterText] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<
    Transaction["id"] | null
  >(null);
  const [selectedTransactionInfo, setSelectedTransactionInfo] =
    useState<TransactionDetail | null>(null);

  const closeModal = () => {
    setSelectedTransactionInfo(null);
    setSelectedTransaction(null);
  };

  const fetchTransactions = async () => {
    const response = await fetch(
      "https://shinetools-banking-app--ahz7kybtxu.expo.app/api/transactions"
    );
    const { data } = await response.json();
    return data;
  };

  const fetchTransactionById = async (
    id: Transaction["id"]
  ): Promise<TransactionDetail> => {
    const response = await fetch(
      `https://shinetools-banking-app--ahz7kybtxu.expo.app/api/transactions/${id}`
    );
    const { data } = await response.json();
    return data;
  };

  const handleFilterTransactions = () => {
    if (filterText.trim() === "") {
      setTransactions(allTransactions);
      return;
    }

    const filtered = allTransactions.filter(
      (transaction) =>
        transaction.description
          .toLowerCase()
          .includes(filterText.toLowerCase()) ||
        transaction.category.toLowerCase().includes(filterText.toLowerCase()) ||
        transaction.amount.toString().includes(filterText)
    );
    setTransactions(filtered);
  };

  useEffect(() => {
    fetchTransactions().then((data) => {
      setAllTransactions(data);
      setTransactions(data);
    });
  }, []);

  useEffect(() => {
    if (selectedTransaction) {
      fetchTransactionById(selectedTransaction).then(
        setSelectedTransactionInfo
      );
    } else {
      setSelectedTransactionInfo(null);
    }
  }, [selectedTransaction]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search by description, category, or amount..."
          value={filterText}
          onChangeText={setFilterText}
          onSubmitEditing={handleFilterTransactions}
        />
        <Pressable style={styles.button} onPress={handleFilterTransactions}>
          <Text style={styles.buttonLabel}>Filter</Text>
        </Pressable>
        {filterText !== "" && (
          <Pressable
            style={styles.clearButton}
            onPress={() => {
              setFilterText("");
              setTransactions(allTransactions);
            }}
          >
            <Text style={styles.clearButtonLabel}>Clear</Text>
          </Pressable>
        )}
      </View>
      <ScrollView style={styles.scrollView}>
        {transactions.map((transaction) => (
          <Pressable
            style={styles.transactionContainer}
            key={transaction.id}
            onPress={() => {
              fetch(
                `https://shinetools-banking-app--ahz7kybtxu.expo.app/api/transactions/${transaction.id}`,
                {
                  method: "PATCH",
                  body: JSON.stringify({ internal: !transaction.internal }),
                }
              );
              const updatedTransactions = allTransactions.map((t) =>
                t.id === transaction.id ? { ...t, internal: !t.internal } : t
              );
              setAllTransactions(updatedTransactions);
              setTransactions(updatedTransactions);
            }}
          >
            <View
              style={[
                styles.transactionCheckbox,
                transaction.internal && styles.transactionCheckboxInternal,
              ]}
            />
            <View style={styles.transactionInfo}>
              <Text
                numberOfLines={1}
                style={[
                  styles.transactionDescription,
                  transaction.internal && styles.transactionDescriptionInternal,
                ]}
              >
                {transaction.description}
              </Text>
              <Text style={styles.transactionCategory}>
                {transaction.category}
              </Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                transaction.amount >= 0
                  ? styles.transactionAmountPositive
                  : styles.transactionAmountNegative,
              ]}
            >
              ${transaction.amount.toFixed(2)}
            </Text>
            <Pressable onPress={() => setSelectedTransaction(transaction.id)}>
              <Text>See</Text>
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
      <Modal
        animationType="slide"
        visible={Boolean(selectedTransactionInfo)}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Transaction Details</Text>
          <View style={styles.modalDetailsContainer}>
            <Text style={styles.modalLabel}>Description:</Text>
            <Text style={styles.modalDescription}>
              {selectedTransactionInfo?.description}
            </Text>
            <Text style={styles.modalLabel}>Amount:</Text>
            <Text
              style={[
                styles.modalAmount,
                selectedTransactionInfo && selectedTransactionInfo.amount >= 0
                  ? styles.transactionAmountPositive
                  : styles.transactionAmountNegative,
              ]}
            >
              ${selectedTransactionInfo?.amount.toFixed(2)}
            </Text>
            <Text style={styles.modalLabel}>Category:</Text>
            <Text style={styles.modalDescription}>
              {selectedTransactionInfo?.category}
            </Text>
            <Text style={styles.modalLabel}>Merchant:</Text>
            <Text style={styles.modalDescription}>
              {selectedTransactionInfo?.merchant || "N/A"}
            </Text>
            <Text style={styles.modalLabel}>Payment Method:</Text>
            <Text style={styles.modalDescription}>
              {selectedTransactionInfo?.paymentMethod
                .replace("_", " ")
                .toUpperCase()}
            </Text>
            <Text style={styles.modalLabel}>Reference Number:</Text>
            <Text style={styles.modalDescription}>
              {selectedTransactionInfo?.referenceNumber}
            </Text>
            {selectedTransactionInfo?.notes && (
              <>
                <Text style={styles.modalLabel}>Notes:</Text>
                <Text style={styles.modalDescription}>
                  {selectedTransactionInfo.notes}
                </Text>
              </>
            )}
            <Text style={styles.modalLabel}>Type:</Text>
            <Text style={styles.modalDescription}>
              {selectedTransactionInfo?.internal
                ? "Internal Transfer"
                : "External Transaction"}
            </Text>
          </View>
          <View style={styles.modalButtonContainer}>
            <Pressable
              style={styles.modalNextButton}
              onPress={() => {
                const nextTransaction = transactions.findIndex(
                  (t) => t.id === selectedTransactionInfo?.id
                );
                if (nextTransaction < transactions.length - 1) {
                  setSelectedTransaction(transactions[nextTransaction + 1].id);
                } else {
                  setSelectedTransaction(transactions[0].id);
                }
              }}
            >
              <Text style={styles.modalButtonLabel}>Show Next</Text>
            </Pressable>
            <Pressable style={styles.modalCloseButton} onPress={closeModal}>
              <Text style={styles.modalButtonLabel}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  inputContainer: {
    marginVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    minWidth: 200,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 8,
  },
  button: {
    borderRadius: 6,
    backgroundColor: "#3b82f6",
    padding: 8,
    paddingHorizontal: 16,
  },
  buttonLabel: {
    color: "#ffffff",
    fontWeight: "600",
  },
  clearButton: {
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
    padding: 8,
    paddingHorizontal: 16,
  },
  clearButtonLabel: {
    color: "#374151",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  transactionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: "600",
  },
  transactionDescriptionInternal: {
    color: "#6b7280",
  },
  transactionCategory: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  transactionAmountPositive: {
    color: "#10b981",
  },
  transactionAmountNegative: {
    color: "#ef4444",
  },
  transactionCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6b7280",
  },
  transactionCheckboxInternal: {
    backgroundColor: "#6b7280",
  },
  modalContainer: {
    paddingVertical: 60,
    flex: 1,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  modalDetailsContainer: {
    flex: 1,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
    marginBottom: 4,
  },
  modalDescription: {
    fontSize: 16,
    color: "#111827",
  },
  modalAmount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalButtonContainer: {
    marginTop: "auto",
    width: "100%",
    gap: 8,
  },
  modalNextButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#3b82f6",
    padding: 16,
  },
  modalCloseButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#9ca3af",
    padding: 16,
  },
  modalButtonLabel: {
    fontWeight: "bold",
    color: "#ffffff",
  },
});
