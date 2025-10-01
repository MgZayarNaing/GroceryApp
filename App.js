import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, FlatList, TouchableOpacity, 
  Platform, StyleSheet, Modal, Button, StatusBar, SafeAreaView 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import CheckBox from '@react-native-community/checkbox';

export default function App() {
  const [item, setItem] = useState("");
  const [list, setList] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const getDateKey = (d) => "@grocery_list_" + d.toISOString().slice(0,10);

  useEffect(() => {
    loadList(date);
  }, [date]);

  const loadList = async (d) => {
    try {
      const jsonValue = await AsyncStorage.getItem(getDateKey(d));
      setList(jsonValue ? JSON.parse(jsonValue) : []);
    } catch(e) { console.log(e); }
  };

  const saveList = async (d, newList) => {
    try {
      await AsyncStorage.setItem(getDateKey(d), JSON.stringify(newList));
    } catch(e) { console.log(e); }
  };

  const addItem = () => {
    if (item.trim() === "") return;
    const newList = [...list, { id: Date.now().toString(), name: item, done: false }];
    setList(newList);
    saveList(date, newList);
    setItem("");
    setModalVisible(false);
  };

  const toggleDone = (id) => {
    const newList = list.map(i => i.id === id ? { ...i, done: !i.done } : i);
    setList(newList);
    saveList(date, newList);
  };

  const confirmDeleteItem = (id) => {
    setDeleteItemId(id);
    setDeleteModalVisible(true);
  };

  const deleteItem = () => {
    const newList = list.filter(i => i.id !== deleteItemId);
    setList(newList);
    saveList(date, newList);
    setDeleteModalVisible(false);
    setDeleteItemId(null);
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <StatusBar hidden={false} barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={styles.title}>🛒 Grocery List</Text>

        {/* Date Picker */}
        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
          <Text style={{ color: "#fff" }}>Select Date: {date.toISOString().slice(0,10)}</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}

        {/* List */}
        <FlatList
          style={{ marginTop: 20 }}
          data={list}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <CheckBox
                value={item.done}
                onValueChange={() => toggleDone(item.id)}
              />
              <Text style={[styles.listText, item.done && styles.listTextDone]}>
                {item.name}
              </Text>
              <TouchableOpacity onPress={() => confirmDeleteItem(item.id)}>
                <Text style={styles.deleteText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Floating Add Button */}
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Text style={{ color: "#fff", fontSize: 24 }}>＋</Text>
        </TouchableOpacity>

        {/* Modal for adding item */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={{ fontSize: 20, marginBottom: 10 }}>Add New Item</Text>
              <TextInput
                placeholder="Enter item"
                value={item}
                onChangeText={setItem}
                style={styles.input}
              />
              <Button title="Add Item" onPress={addItem} color="#4CAF50" />
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="#f44336" />
            </View>
          </View>
        </Modal>

        {/* Modal for delete confirmation */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={{ fontSize: 18, marginBottom: 20 }}>Are you sure you want to delete this item?</Text>
              <Button title="Confirm Delete" onPress={deleteItem} color="#f44336" />
              <Button title="Cancel" onPress={() => setDeleteModalVisible(false)} color="#2196F3" />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10, color: "#333" },
  input: {
    borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8,
    backgroundColor: "#fff", fontSize: 16, marginBottom: 10
  },
  fab: {
    position: 'absolute', right: 20, bottom: 30, backgroundColor: "#4CAF50",
    width: 60, height: 60, borderRadius: 30, justifyContent: 'center',
    alignItems: 'center', elevation: 5, shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4
  },
  dateButton: {
    backgroundColor: "#2196F3", padding: 10, borderRadius: 8,
    alignItems: 'center', marginBottom: 10
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center'
  },
  modalContent: {
    width: '85%', backgroundColor: '#fff', padding: 20,
    borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 5
  },
  listItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 15, marginBottom: 10, borderRadius: 12, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2,
    shadowRadius: 3, elevation: 3
  },
  listText: { fontSize: 18, color: "#333", flex: 1 },
  listTextDone: { textDecorationLine: 'line-through', color: '#999' },
  deleteText: { fontSize: 20, color: '#f44336', marginLeft: 10 }
});
