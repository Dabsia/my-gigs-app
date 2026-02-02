import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  FlatList,
} from "react-native";
import {
  Plus,
  X,
  Calendar,
  Trash2,
  User,
  Building,
  Edit3,
} from "lucide-react-native";
import Layout from "@/components/Layout/Layout";
import BackBtn from "@/components/BackBtn/BackBtn";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";
import { useRouter } from "expo-router";

const NewInvoice = () => {
  const router = useRouter();

  // Bank info state - now editable
  const [bankInfo, setBankInfo] = useState({
    bankName: "Chase Bank",
    accountHolderName: "Your Business Name",
    iban: "US64SVZCUS6S3300958879",
    swift: "CHASUS33",
    // paymentInstructions:
    //   "Please include invoice number as reference. Payments due within 30 days.",
  });

  const [isEditingBankInfo, setIsEditingBankInfo] = useState(false);
  const [tempBankInfo, setTempBankInfo] = useState({ ...bankInfo });

  const clients = [
    {
      id: 1,
      name: "Aria Technologies",
      email: "ariatech@gmail.com",
      address: "123 Tech Avenue, Suite 400\nInnovate City, CA 94043",
    },
    {
      id: 2,
      name: "TechCorp Inc",
      email: "billing@techcorp.com",
      address: "456 Business Blvd\nNew York, NY 10001",
    },
  ];

  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    address: "",
  });

  // Auto-generate function
  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    return `INV-${year}${month}${day}-${random}`;
  };

  const [invoice, setInvoice] = useState({
    invoiceNumber: generateInvoiceNumber(),
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    items: [
      {
        id: 1,
        description: "Mobile App Development",
        hours: 40,
        rate: 100,
        total: 4000.0,
      },
      {
        id: 2,
        description: "UI/UX Design",
        hours: 15,
        rate: 100,
        total: 1500.0,
      },
    ],
    taxRate: 10,
    notes: "Payment is due within 30 days",
  });

  // Calculate derived values
  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * (invoice.taxRate / 100);
  const total = subtotal + tax;

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Bank Info Functions
  const handleEditBankInfo = () => {
    setTempBankInfo({ ...bankInfo });
    setIsEditingBankInfo(true);
  };

  const handleSaveBankInfo = () => {
    // Basic validation
    if (!tempBankInfo.bankName.trim()) {
      Alert.alert("Error", "Please enter bank name");
      return;
    }
    if (!tempBankInfo.accountHolderName.trim()) {
      Alert.alert("Error", "Please enter account holder name");
      return;
    }
    if (!tempBankInfo.iban.trim()) {
      Alert.alert("Error", "Please enter IBAN");
      return;
    }
    if (!tempBankInfo.swift.trim()) {
      Alert.alert("Error", "Please enter SWIFT/BIC code");
      return;
    }

    setBankInfo({ ...tempBankInfo });
    setIsEditingBankInfo(false);
    Alert.alert("Success", "Bank information updated");
  };

  const handleCancelEditBankInfo = () => {
    setIsEditingBankInfo(false);
    setTempBankInfo({ ...bankInfo });
  };

  const updateTempBankInfo = (field, value) => {
    setTempBankInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setShowClientModal(false);
  };

  const handleCreateNewClient = () => {
    if (!newClient.name.trim()) {
      Alert.alert("Error", "Please enter a client name");
      return;
    }

    if (!newClient.email.trim()) {
      Alert.alert("Error", "Please enter a client email");
      return;
    }

    const client = {
      id: Date.now(),
      name: newClient.name.trim(),
      email: newClient.email.trim(),
      address: newClient.address.trim(),
    };

    setSelectedClient(client);
    setShowNewClientModal(false);
    setShowClientModal(false);

    // Reset new client form
    setNewClient({
      name: "",
      email: "",
      address: "",
    });
  };

  const addNewItem = () => {
    const newItem = {
      id: Date.now(),
      description: "New Service",
      hours: 1,
      rate: 0,
      total: 0,
    };

    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const updateItem = (itemId, field, value) => {
    setInvoice((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate total when hours or rate changes
          if (field === "hours" || field === "rate") {
            updatedItem.total = updatedItem.hours * updatedItem.rate;
          }

          return updatedItem;
        }
        return item;
      });
      return { ...prev, items: updatedItems };
    });
  };

  const removeItem = (itemId) => {
    if (invoice.items.length <= 1) {
      Alert.alert("Cannot Remove", "Invoice must have at least one item");
      return;
    }

    Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setInvoice((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.id !== itemId),
          }));
        },
      },
    ]);
  };

  const handleSaveInvoice = () => {
    if (!selectedClient) {
      Alert.alert("Client Required", "Please select a client before saving.");
      return;
    }

    if (
      invoice.items.some((item) => item.description === "" || item.rate <= 0)
    ) {
      Alert.alert(
        "Invalid Items",
        "Please ensure all items have descriptions and valid rates."
      );
      return;
    }

    Alert.alert(
      "Invoice Saved",
      `Invoice ${invoice.invoiceNumber} has been saved successfully!`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const renderBankInfoModal = () => (
    <Modal
      visible={isEditingBankInfo}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-semiBold text-gray-900">
            Edit Bank Information
          </Text>
          <TouchableOpacity onPress={handleCancelEditBankInfo}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1  p-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Security Note */}
          <View className="bg-blue-50 rounded-[12px] px-3 py-4 border border-blue-200 mb-6">
            <Text className="text-blue-800 text-sm font-regular">
              🔒 Your bank information is securely encrypted and only used for
              invoice generation.
            </Text>
          </View>

          {/* Bank Name */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 font-regular mb-2">
              Bank Name *
            </Text>
            <TextInput
              className="bg-white border border-secondary rounded-[12px] px-4 py-4 text-gray-900 font-regular text-base"
              placeholder="Enter bank name"
              value={tempBankInfo.bankName}
              onChangeText={(text) => updateTempBankInfo("bankName", text)}
            />
          </View>

          {/* Account Holder Name */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 font-regular mb-2">
              Account Holder Name *
            </Text>
            <TextInput
              className="bg-white border border-secondary rounded-[12px] px-4 py-4 text-gray-900 font-regular text-base"
              placeholder="Enter full name"
              value={tempBankInfo.accountHolderName}
              onChangeText={(text) =>
                updateTempBankInfo("accountHolderName", text)
              }
              autoCapitalize="words"
            />
          </View>

          {/* IBAN */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 font-regular mb-2">
              IBAN *
            </Text>
            <TextInput
              className="bg-white border border-secondary rounded-[12px] px-4 py-4 text-gray-900 font-regular text-base"
              placeholder="Enter IBAN"
              value={tempBankInfo.iban}
              onChangeText={(text) => updateTempBankInfo("iban", text)}
              autoCapitalize="characters"
            />
          </View>

          {/* SWIFT/BIC */}
          <View className="mb-6">
            <Text className="text-sm text-gray-600 font-regular mb-2">
              SWIFT/BIC Code *
            </Text>
            <TextInput
              className="bg-white border border-secondary rounded-[12px] px-4 py-4 text-gray-900 font-regular text-base"
              placeholder="Enter SWIFT/BIC"
              value={tempBankInfo.swift}
              onChangeText={(text) => updateTempBankInfo("swift", text)}
              autoCapitalize="characters"
            />
          </View>

          {/* Payment Instructions */}
          {/* <View className="mb-6">
            <Text className="text-sm text-gray-600 font-regular mb-2">
              Payment Instructions
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-[12px] px-4 py-3 text-gray-900 font-regular text-base min-h-[80px]"
              placeholder="Enter payment instructions"
              value={tempBankInfo.paymentInstructions}
              onChangeText={(text) =>
                updateTempBankInfo("paymentInstructions", text)
              }
              multiline
              textAlignVertical="top"
            />
          </View> */}

          {/* Action Buttons */}
          <View className="flex-col space-x-3 mb-6">
            <TouchableOpacity
              className="flex-1 border border-gray-300 rounded-[12px] py-4 items-center"
              onPress={handleCancelEditBankInfo}
            >
              <Text className="text-gray-600 font-semiBold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-500 mt-3 rounded-[12px] py-4 items-center"
              onPress={handleSaveBankInfo}
            >
              <Text className="text-white font-semiBold">Save Changes</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderClientModal = () => (
    <Modal
      visible={showClientModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-semiBold text-gray-900">
            Select Client
          </Text>
          <TouchableOpacity onPress={() => setShowClientModal(false)}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Add New Client Button */}
        <TouchableOpacity
          className="flex-row items-center p-4 border-b border-gray-100 bg-blue-50"
          onPress={() => setShowNewClientModal(true)}
        >
          <View className="bg-blue-500 w-10 h-10 rounded-full items-center justify-center mr-3">
            <Plus size={20} color="white" />
          </View>
          <View>
            <Text className="text-base font-semiBold text-gray-900">
              Add New Client
            </Text>
            <Text className="text-sm text-gray-600">
              Create a new client profile
            </Text>
          </View>
        </TouchableOpacity>

        <FlatList
          data={clients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="p-4 border-b border-gray-100"
              onPress={() => handleSelectClient(item)}
            >
              <Text className="text-base font-semiBold text-gray-900">
                {item.name}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">{item.email}</Text>
              {item.address ? (
                <Text className="text-sm text-gray-500 mt-1">
                  {item.address}
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );

  const renderNewClientModal = () => (
    <Modal
      visible={showNewClientModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-semiBold text-gray-900">
            New Client
          </Text>
          <TouchableOpacity onPress={() => setShowNewClientModal(false)}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Client Name */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 font-regular mb-2">
              Client Name *
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg p-3">
              <Building size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-2 text-base text-gray-900"
                placeholder="Enter client name"
                value={newClient.name}
                onChangeText={(text) =>
                  setNewClient((prev) => ({ ...prev, name: text }))
                }
              />
            </View>
          </View>

          {/* Client Email */}
          <View className="mb-4">
            <Text className="text-sm text-gray-600 font-regular mb-2">
              Email Address *
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg p-3">
              <User size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-2 text-base text-gray-900"
                placeholder="Enter email address"
                value={newClient.email}
                onChangeText={(text) =>
                  setNewClient((prev) => ({ ...prev, email: text }))
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Client Address */}
          <View className="mb-6">
            <Text className="text-sm text-gray-600 font-regular mb-2">
              Billing Address
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base text-gray-900 min-h-[100px]"
              placeholder="Enter billing address (optional)"
              value={newClient.address}
              onChangeText={(text) =>
                setNewClient((prev) => ({ ...prev, address: text }))
              }
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Action Buttons */}
          <View className="flex-col space-x-3">
            <TouchableOpacity
              className="flex-1 border border-gray-300 rounded-lg p-4 items-center"
              onPress={() => setShowNewClientModal(false)}
            >
              <Text className="text-gray-600 font-semiBold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-500 mt-3 rounded-lg p-4 items-center"
              onPress={handleCreateNewClient}
            >
              <Text className="text-white font-semiBold">Create Client</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderItemRow = (item) => {
    return (
      <View
        key={item.id}
        className="mb-6 p-4 border border-gray-200 rounded-lg"
      >
        <View className="flex-row items-center justify-between mb-3">
          <TextInput
            className="flex-1 text-base font-semiBold text-gray-900"
            value={item.description}
            onChangeText={(text) => updateItem(item.id, "description", text)}
            placeholder="Service description"
          />
          <TouchableOpacity onPress={() => removeItem(item.id)} className="p-2">
            <Trash2 size={18} color="#dc2626" />
          </TouchableOpacity>
        </View>

        {/* Hours and Rate */}
        <View className="flex-row ">
          <View className="flex-1 mr-2">
            <Text className="text-sm font-regular text-gray-600 mb-1">
              Hours
            </Text>
            <TextInput
              className="border border-gray-300 font-regular rounded-lg p-2 text-center"
              value={item.hours.toString()}
              onChangeText={(text) =>
                updateItem(item.id, "hours", parseInt(text) || 0)
              }
              keyboardType="numeric"
            />
          </View>

          <View className="flex-1 mx-2">
            <Text className="text-sm font-regular text-gray-600 mb-1">
              Hourly Rate ($)
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg font-regular p-2 text-center"
              value={item.rate.toString()}
              onChangeText={(text) =>
                updateItem(item.id, "rate", parseFloat(text) || 0)
              }
              keyboardType="numeric"
            />
          </View>

          <View className="flex-1 ml-2 justify-center">
            <Text className="text-sm text-gray-600 font-regular mb-1">
              Total
            </Text>
            <Text className="text-base font-semiBold text-gray-900 text-center">
              ${item.total.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Layout>
      <View className="flex-1 ">
        <View className="pt-4 border-b border-gray-200 ">
          <View className="flex-row items-center justify-between mb-4">
            <BackBtn title="New Invoice" />
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Text className="text-2xl font-bold text-gray-900 mt-6 mb-8">
            New Invoice
          </Text>

          {/* Bill To Section */}
          <View className="mb-6">
            <Text className="text-lg font-semiBold text-gray-900 mb-3">
              Bill To
            </Text>
            {selectedClient ? (
              <TouchableOpacity
                className="border border-gray-300 rounded-lg p-4"
                onPress={() => setShowClientModal(true)}
              >
                <Text className="text-base font-semiBold text-gray-900">
                  {selectedClient.name}
                </Text>
                <Text className="text-gray-600 text-sm font-regular mt-1">
                  {selectedClient.email}
                </Text>
                {selectedClient.address ? (
                  <Text className="text-gray-500 text-sm font-regular mt-2">
                    {selectedClient.address}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="border border-dashed border-gray-300 rounded-lg p-4 items-center justify-center"
                onPress={() => setShowClientModal(true)}
              >
                <Text className="text-gray-500 text-base font-regular mb-2">
                  Select a client
                </Text>
                <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center">
                  <Plus size={20} color="white" />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Invoice Details */}
          <View className="mb-6">
            <Text className="text-lg font-semiBold text-gray-900 mb-3">
              Invoice Number
            </Text>
            <View className="border-b border-gray-300 py-2">
              <Text className="text-lg font-regular text-gray-900 mb-3">
                {invoice.invoiceNumber}
              </Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-semiBold text-gray-900 mb-3">
              Issue Date
            </Text>
            <View className="flex-row items-center justify-between border-b border-gray-300 py-2">
              <Text className="text-base font-regular text-gray-900">
                {formatDate(invoice.issueDate)}
              </Text>
              <Calendar size={18} color="#6b7280" />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-semiBold text-gray-900 mb-3">
              Due Date
            </Text>
            <View className="flex-row items-center justify-between border-b border-gray-300 py-2">
              <Text className="text-base font-regular text-gray-900">
                {formatDate(invoice.dueDate)}
              </Text>
              <Calendar size={18} color="#6b7280" />
            </View>
          </View>

          <View className="border-t border-gray-200 my-4" />

          {/* Items Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semiBold text-gray-900">
                Services
              </Text>
            </View>

            {invoice.items.map(renderItemRow)}

            <TouchableOpacity
              className="border border-dashed border-gray-300 rounded-lg p-4 items-center justify-center mt-2"
              onPress={addNewItem}
            >
              <Text className="text-blue-500 text-base font-regular">
                Add Services
              </Text>
            </TouchableOpacity>
          </View>

          {/* Totals Section */}
          <View className="mb-6">
            <View className="border border-gray-200 rounded-lg overflow-hidden">
              <View className="flex-row border-b border-gray-200">
                <View className="flex-1 p-3">
                  <Text className="text-sm text-gray-600 font-regular">
                    Subtotal
                  </Text>
                </View>
                <View className="flex-1 p-3">
                  <Text className="text-sm text-gray-600 font-regular text-right">
                    ${subtotal.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View className="flex-row border-b items-center border-gray-200">
                <View className="flex-1 p-3">
                  <Text className="text-sm text-gray-600 font-regular">
                    Tax %
                  </Text>
                </View>
                <View className="flex-1 p-3">
                  <View className="flex-row justify-between items-center">
                    <TextInput
                      className="text-sm text-gray-600 font-regular w-12"
                      value={invoice.taxRate.toString()}
                      onChangeText={(text) =>
                        setInvoice((prev) => ({
                          ...prev,
                          taxRate: parseInt(text) || 0,
                        }))
                      }
                      keyboardType="numeric"
                    />
                    <Text className="text-sm text-gray-600 font-regular">
                      ${tax.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="flex-row ">
                <View className="flex-1 p-3">
                  <Text className="text-base font-semiBold text-gray-900">
                    Total
                  </Text>
                </View>
                <View className="flex-1 p-3">
                  <Text className="text-base font-semiBold text-gray-900 text-right">
                    ${total.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Payment Information Section */}
          <View className="mb-6">
            <Text className="text-lg font-semiBold text-gray-900 mb-3">
              Payment Information
            </Text>

            {/* Informational Message */}
            <View className="bg-blue-50 rounded-[12px] p-4 border border-blue-200 mb-4">
              <Text className="text-blue-800 text-sm font-regular">
                💫 Bank account on invoice{"\n"}
                Adding a bank account allows customers to pay you faster! Your
                bank details will be included in your outgoing invoices.
              </Text>
            </View>

            <View className="border border-gray-200 rounded-lg p-4">
              {/* Header with Edit Button */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  {/* <Bank size={18} color="#3b82f6" /> */}
                  <Text className="text-base font-semiBold text-gray-900 ml-2">
                    Bank Transfer
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleEditBankInfo}
                  className="flex-row items-center"
                >
                  <Edit3 size={16} color="#3b82f6" />
                  <Text className="text-blue-500 font-semiBold text-sm ml-1">
                    Edit
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Bank Details */}
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600 font-regular">
                    Bank Name:
                  </Text>
                  <Text className="text-sm text-gray-900 font-regular">
                    {bankInfo.bankName}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600 font-regular">
                    Account Holder:
                  </Text>
                  <Text className="text-sm text-gray-900 font-regular">
                    {bankInfo.accountHolderName}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600 font-regular">
                    IBAN:
                  </Text>
                  <Text className="text-sm text-gray-900 font-regular">
                    {bankInfo.iban}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600 font-regular">
                    SWIFT/BIC:
                  </Text>
                  <Text className="text-sm text-gray-900 font-regular">
                    {bankInfo.swift}
                  </Text>
                </View>
              </View>

              {/* Payment Instructions */}
              {bankInfo.paymentInstructions && (
                <View className="mt-4 pt-4 border-t border-gray-200">
                  <Text className="text-sm text-gray-600 font-regular">
                    {bankInfo.paymentInstructions}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Notes Section */}
          <View className="mb-8">
            <Text className="text-lg font-semiBold text-gray-900 mb-3">
              Notes / Terms
            </Text>
            <TextInput
              className="text-gray-600 text-sm font-regular leading-5 border border-secondary rounded-lg p-3 min-h-[100px]"
              value={invoice.notes}
              placeholder="Payment is due within 30 days"
              onChangeText={(text) =>
                setInvoice((prev) => ({ ...prev, notes: text }))
              }
              multiline
              textAlignVertical="top"
            />
          </View>
          <PrimaryBtn
            text="Create Invoice"
            handlePress={handleSaveInvoice}
            className="mb-6"
          />
        </ScrollView>

        {renderBankInfoModal()}
        {renderClientModal()}
        {renderNewClientModal()}
      </View>
    </Layout>
  );
};

export default NewInvoice;
