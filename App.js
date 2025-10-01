import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function App() {
  const [item, setItem] = useState("");
  const [list, setList] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const getDateKey = (d) => "@grocery_list_" + d.toISOString().slice(0,10);

  // Load list when app starts or date changes
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
  };

  const toggleDone = (id) => {
    const newList = list.map(i => i.id === id ? { ...i, done: !i.done } : i);
    setList(newList);
    saveList(date, newList);
  };

  const deleteItem = (id) => {
    const newList = list.filter(i => i.id !== id);
    setList(newList);
    saveList(date, newList);
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <View style={{ flex: 1, padding: 20, marginTop: 50, backgroundColor: "#f5f5f5" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 10, color: "#333" }}>
        🛒 Grocery List
      </Text>

      {/* Date Picker */}
      <Button title={`Select Date: ${date.toISOString().slice(0,10)}`} onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      {/* Add Item Input */}
      <TextInput
        placeholder="Enter item"
        value={item}
        onChangeText={setItem}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          marginVertical: 12,
          borderRadius: 8,
          backgroundColor: "#fff",
          fontSize: 16,
        }}
      />
      <Button title="Add Item" onPress={addItem} color="#4CAF50" />

      {/* List */}
      <FlatList
        style={{ marginTop: 20 }}
        data={list}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleDone(item.id)}
            onLongPress={() => deleteItem(item.id)}
            style={{
              backgroundColor: item.done ? "#d3f8e2" : "#fff",
              padding: 15,
              marginBottom: 10,
              borderRadius: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: item.done ? "#999" : "#333",
                textDecorationLine: item.done ? "line-through" : "none",
              }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
