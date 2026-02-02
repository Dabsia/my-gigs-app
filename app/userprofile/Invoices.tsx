import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Search, ChevronRight } from "lucide-react-native";
import CreateNewGig from "@/components/CreateNewGig/CreateNewGig";
import Layout from "@/components/Layout/Layout";
import BackBtn from "@/components/BackBtn/BackBtn";
import { useRouter } from "expo-router";

type InvoiceStatus = "PAID" | "PENDING" | "OVERDUE";

interface Invoice {
  id: string;
  company: string;
  invoiceNumber: string;
  amount: string;
  status: InvoiceStatus;
  dateInfo: string;
  initials: string;
}

const InvoiceItem = ({
  invoice,
  onPress,
}: {
  invoice: Invoice;
  onPress: () => void;
}) => {
  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case "PAID":
        return "bg-[#CCFBF1]";
      case "PENDING":
        return "bg-[#FEF9C3]";
      case "OVERDUE":
        return "bg-[#FEE2E2]";
      default:
        return "bg-gray-100";
    }
  };

  const getStatusTextColor = (status: InvoiceStatus) => {
    switch (status) {
      case "PAID":
        return "text-[#43978F]";
      case "PENDING":
        return "text-[#D97706]";
      case "OVERDUE":
        return "text-[#DC2626]";
      default:
        return "text-gray-800";
    }
  };

  return (
    <Pressable
      onPress={onPress}
      className=" pb-2 pt-4 rounded-[12px] h-[155px] mb-4 bg-white px-4 "
    >
      <View className="flex-row  items-center justify-between">
        <View className="flex-1 justify-between h-full">
          {/* Company with Avatar */}
          <View className="flex-row border-b justify-between border-[#F4F7FA] pb-3 items-center">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#E9D5FF] rounded-full items-center justify-center mr-3">
                <Text className="text-gray-700 font-semiBold text-sm">
                  {invoice.initials}
                </Text>
              </View>
              <View>
                <Text className="text-gray-900 font-semiBold text-base">
                  {invoice.company}
                </Text>
                <Text className="text-gray-500 text-sm font-regular mt-1">
                  {invoice.invoiceNumber}
                </Text>
              </View>
            </View>
            <ChevronRight color="#061D3F" />
          </View>

          {/* Amount and Status */}
          <View className="flex-row justify-between items-center mt-3">
            <Text className="text-lg font-semiBold text-gray-900">
              {invoice.amount}
            </Text>
            <View
              className={`rounded-[8px] items-center justify-center py-2 px-4 ${getStatusColor(
                invoice.status
              )}`}
            >
              <Text
                className={`font-regular text-sm ${getStatusTextColor(
                  invoice.status
                )}`}
              >
                {invoice.status}
              </Text>
            </View>
          </View>

          {/* Date Info */}
          <Text className="text-gray-500 text-sm font-regular mt-2">
            {invoice.dateInfo}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const Invoice = () => {
  const [activeTab, setActiveTab] = useState<
    "ALL" | "PAID" | "PENDING" | "OVERDUE"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [invoices] = useState<Invoice[]>([
    {
      id: "1",
      company: "Innovate Inc.",
      invoiceNumber: "Invoice #INV-2024-001",
      amount: "$1,250.00",
      status: "PAID",
      dateInfo: "Paid on May 15, 2024",
      initials: "II",
    },
    {
      id: "2",
      company: "Creative Solutions LLC",
      invoiceNumber: "Invoice #INV-2024-002",
      amount: "$850.50",
      status: "PENDING",
      dateInfo: "Due in 5 days",
      initials: "CS",
    },
    {
      id: "3",
      company: "Tech Forward Co.",
      invoiceNumber: "Invoice #INV-2024-003",
      amount: "$2,500.00",
      status: "OVERDUE",
      dateInfo: "Overdue by 10 days",
      initials: "TF",
    },
    {
      id: "4",
      company: "Quantum Dynamics",
      invoiceNumber: "Invoice #INV-2024-004",
      amount: "$5,300.00",
      status: "PAID",
      dateInfo: "Paid on May 10, 2024",
      initials: "QD",
    },
    {
      id: "5",
      company: "Global Tech Partners",
      invoiceNumber: "Invoice #INV-2024-005",
      amount: "$3,200.00",
      status: "PENDING",
      dateInfo: "Due in 2 days",
      initials: "GT",
    },
  ]);

  const tabs = [
    { key: "ALL" as const, label: "All" },
    { key: "PAID" as const, label: "Paid" },
    { key: "PENDING" as const, label: "Pending" },
    { key: "OVERDUE" as const, label: "Overdue" },
  ];

  // Filter invoices based on active tab and search query
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesTab = activeTab === "ALL" || invoice.status === activeTab;
    const matchesSearch =
      invoice.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.amount.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleTabPress = (tab: "ALL" | "PAID" | "PENDING" | "OVERDUE") => {
    setActiveTab(tab);
  };

  const handleInvoicePress = (invoiceId: string) => {
    // Navigate to invoice details
    console.log("Invoice pressed:", invoiceId);
  };

  const router = useRouter();

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <InvoiceItem
      invoice={item}
      onPress={() => router.push(`/userprofile/invoice/item.id`)}
    />
  );

  const renderEmptyState = () => (
    <View className="py-8 items-center">
      <Text className="text-gray-500 text-base">No invoices found</Text>
    </View>
  );

  return (
    <Layout>
      <View className="flex-1 ">
        {/* Header */}
        <View className="">
          <View className="my-4">
            <BackBtn title="Invoices" />
          </View>

          {/* Search Bar */}
          <View className="pb-4">
            <View className="flex-row border border-secondary items-center bg-gray-100 rounded-lg px-2 py-1">
              <Search color="#061D3F" />
              <TextInput
                className="w-full font-regular rounded-lg p-4 text-secondary"
                placeholder="Search invoices..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
            </View>
          </View>

          {/* Tabs */}
          <View className="flex-row border-b border-gray-200">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                className="pb-3 border-b-2 mr-6"
                style={{
                  borderBottomColor:
                    activeTab === tab.key ? "#3B82F6" : "transparent",
                }}
                onPress={() => handleTabPress(tab.key)}
              >
                <Text
                  className={`font-semiBold text-base ${
                    activeTab === tab.key ? "text-blue-500" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Invoice List with FlatList */}
        <FlatList
          data={filteredInvoices}
          renderItem={renderInvoiceItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{ paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        />

        {/* Add Button */}
        <CreateNewGig location="userprofile/invoice/new" />
      </View>
    </Layout>
  );
};

export default Invoice;
