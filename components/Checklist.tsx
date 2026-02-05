import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Task, useTaskStore } from '../store/useTaskStore';

export default function Checklist() {
  const { tasks, fetchTasks, addTask, toggleTask, deleteTask } = useTaskStore();
  const [text, setText] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddItem = async () => {
    if (text.trim().length === 0) return;
    await addTask(text.trim());
    setText('');
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View className="flex-row items-center justify-between p-3 mb-2 bg-gray-800 rounded-lg">
      <TouchableOpacity 
        className="flex-row items-center flex-1" 
        onPress={() => toggleTask(item.id)}
      >
        <Ionicons 
          name={item.is_completed ? "checkbox" : "square-outline"} 
          size={24} 
          color={item.is_completed ? "#4ade80" : "#9ca3af"} 
        />
        <Text 
          className={`ml-3 text-lg ${item.is_completed ? 'text-gray-500 line-through' : 'text-white'}`}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 w-full max-w-md p-4">
      <View className="flex-row mb-4">
        <TextInput
          className="flex-1 p-3 mr-2 text-white bg-gray-700 rounded-lg"
          placeholder="Add a new task..."
          placeholderTextColor="#9ca3af"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleAddItem}
        />
        <TouchableOpacity 
          className="items-center justify-center px-4 bg-blue-600 rounded-lg"
          onPress={handleAddItem}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        className="flex-1"
        contentContainerClassName="pb-4"
        ListEmptyComponent={
          <Text className="mt-10 text-center text-gray-500">
            No tasks yet. Add one above!
          </Text>
        }
      />
    </View>
  );
}
