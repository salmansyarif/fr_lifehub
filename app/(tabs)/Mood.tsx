import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import tw from 'twrnc';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MoodTracker() {
  const [form, setForm] = useState({
    tipe: '',
    jenis_mood: 'Select Mood Type',
    tanggal: '',
  });

  const [tipe, setTipe] = useState<any[]>([]);
  const [showJenisDropdown, setShowJenisDropdown] = useState(false);
  const [dropdownSource, setDropdownSource] = useState<'form' | 'modal'>('form');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [filterType, setFilterType] = useState('All');
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ visible: boolean; id: number | null }>({ visible: false, id: null });
  const [confirmEdit, setConfirmEdit] = useState<{ visible: boolean; item: any | null }>({ visible: false, item: null });
  const [modalValidasiGagal, setModalValidasiGagal] = useState(false);

  const jenisOptions = ['Senang', 'Sedih', 'Stress'];

  const STORAGE_KEY_CHECKED = '@checked_items';

  // Handle form input change
  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Fetch moods from API
  const getTipe = async () => {
    try {
      const response = await fetch('http://10.0.2.2:8000/api/mood');
      const data = await response.json();
      setTipe(data);
    } catch (error) {
      console.error('Error fetching:', error);
    }
  };

  // Load checked items from AsyncStorage
  const loadCheckedItems = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_CHECKED);
      if (jsonValue != null) {
        setCheckedItems(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Failed to load checked items', e);
    }
  };

  // Save checked items to AsyncStorage
  const saveCheckedItems = async () => {
    try {
      const jsonValue = JSON.stringify(checkedItems);
      await AsyncStorage.setItem(STORAGE_KEY_CHECKED, jsonValue);
    } catch (e) {
      console.error('Failed to save checked items', e);
    }
  };

  useEffect(() => {
    getTipe();
    loadCheckedItems();
  }, []);

  useEffect(() => {
    saveCheckedItems();
  }, [checkedItems]);

  // Filter mood list by jenis mood
  const filteredTipe = filterType === 'All' ? tipe : tipe.filter(item => item.jenis_mood === filterType);

  // Toggle checkbox state
  const toggleCheckbox = (id: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Delete handlers
  const handleDelete = (id: number) => {
    setConfirmDelete({ visible: true, id });
  };

  const confirmDeleteYes = async () => {
    if (!confirmDelete.id) return;
    try {
      await fetch(`http://10.0.2.2:8000/api/mood/${confirmDelete.id}`, { method: 'DELETE' });
      getTipe();
      setCheckedItems(prev => {
        const copy = { ...prev };
        delete copy[confirmDelete.id!];
        return copy;
      });
    } catch (error) {
      console.error('Error deleting:', error);
    }
    setConfirmDelete({ visible: false, id: null });
  };

  // Edit handlers
  const handleEdit = (item: any) => {
    setConfirmEdit({ visible: true, item });
  };

  const confirmEditYes = () => {
    if (!confirmEdit.item) return;
    setEditingItem(confirmEdit.item);
    setForm({
      tipe: confirmEdit.item.tipe,
      jenis_mood: confirmEdit.item.jenis_mood,
      tanggal: confirmEdit.item.tanggal,
    });
    setShowEditModal(true);
    setConfirmEdit({ visible: false, item: null });
  };

  // Form validation
  const validateForm = () => {
    if (form.tipe.trim().length < 3) {
      setModalValidasiGagal(true);
      return false;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(form.tanggal)) {
      setModalValidasiGagal(true);
      return false;
    }
    return true;
  };

  // Submit new mood
  const handleSubmit = async () => {
    if (!form.tipe || !form.jenis_mood || form.jenis_mood === 'Select Mood Type' || !form.tanggal) {
      alert('All fields are required');
      return;
    }
    if (!validateForm()) return;

    try {
      await fetch('http://10.0.2.2:8000/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      getTipe();
      setForm({ tipe: '', jenis_mood: 'Select Mood Type', tanggal: '' });
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  // Update existing mood
  const handleUpdate = async () => {
    if (!editingItem) return;
    if (!validateForm()) return;

    try {
      await fetch(`http://10.0.2.2:8000/api/mood/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      getTipe();
      setShowEditModal(false);
      setEditingItem(null);
      setForm({ tipe: '', jenis_mood: 'Select Mood Type', tanggal: '' });
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  // Date picker handlers
  const openDatePicker = () => setShowDatePicker(true);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().slice(0, 10);
      handleChange('tanggal', formattedDate);
    }
  };

  return (
    <View style={tw`flex-1 bg-gray-900 p-6`}>
      <Text style={tw`text-3xl font-bold mb-6 mt-11 text-amber-500 text-center italic`}>MOOD</Text>

      {/* Form tambah mood */}
      <View style={tw`bg-gray-800 rounded-3xl p-6 shadow-xl mb-6`}>
        <TextInput
          style={tw`border-2 border-amber-500 rounded-2xl p-4 mb-4 bg-gray-900 text-amber-400`}
          placeholder="What's your Mood?"
          value={form.tipe}
          onChangeText={text => handleChange('tipe', text)}
          placeholderTextColor="#FCD34D"
        />

        <TouchableOpacity
          style={tw`border-2 border-amber-500 rounded-2xl p-4 mb-4 bg-gray-900`}
          onPress={() => {
            setDropdownSource('form');
            setShowJenisDropdown(true);
          }}
        >
          <Text style={tw`text-amber-400`}>{form.jenis_mood}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`border-2 border-amber-500 rounded-2xl p-4 mb-4 bg-gray-900 justify-center`}
          onPress={openDatePicker}
        >
          <Text style={tw`text-amber-400`}>
            {form.tanggal || 'Select Date (YYYY-MM-DD)'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={form.tanggal ? new Date(form.tanggal) : new Date()}
            mode="date"
            display="default"
            onChange={onChangeDate}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(2000, 0, 1)}
          />
        )}

        <TouchableOpacity
          style={tw`${form.tipe && form.jenis_mood !== 'Select Mood Type' && form.tanggal ? 'bg-amber-600' : 'bg-gray-600'} p-4 rounded-2xl shadow-lg`}
          onPress={handleSubmit}
          disabled={!form.tipe || form.jenis_mood === 'Select Mood Type' || !form.tanggal}
        >
          <Text style={tw`text-gray-900 text-center font-bold text-lg`}>Add Mood</Text>
        </TouchableOpacity>
      </View>

      {/* List mood */}
      <ScrollView style={tw`flex-1`}>
        <Text style={tw`text-2xl font-bold mb-4 text-amber-500 text-center italic`}>Mood List</Text>

        <View style={tw`mb-4 px-4`}>
          <Text style={tw`text-amber-400 font-semibold text-center`}>
            Total: {filteredTipe.length} | Completed: {filteredTipe.filter(item => checkedItems[item.id]).length} | Pending: {filteredTipe.filter(item => !checkedItems[item.id]).length}
          </Text>
        </View>

        {/* Filter Buttons */}
        <View style={tw`flex-row justify-center mb-6 rounded-xl overflow-hidden`}>
          <TouchableOpacity
            style={tw`${filterType === 'All' ? 'bg-amber-600' : 'bg-gray-700'} px-4 py-2 rounded-l-xl`}
            onPress={() => setFilterType('All')}
          >
            <Text style={tw`text-gray-900 font-semibold`}>All</Text>
          </TouchableOpacity>
          {jenisOptions.map(option => (
            <TouchableOpacity
              key={option}
              style={tw`${filterType === option ? 'bg-amber-600' : 'bg-gray-700'} px-4 py-2`}
              onPress={() => setFilterType(option)}
            >
              <Text style={tw`text-gray-900 font-semibold`}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredTipe.map(item => (
          <View
            key={item.id}
            style={tw`bg-gray-800 rounded-xl p-4 mb-3 flex-row justify-between items-center`}
          >
            <TouchableOpacity onPress={() => toggleCheckbox(item.id)} style={tw`mr-4`}>
              <View style={tw`w-6 h-6 border-2 border-amber-500 rounded-lg justify-center items-center`}>
                {checkedItems[item.id] && <View style={tw`w-4 h-4 bg-amber-400 rounded-sm`} />}
              </View>
            </TouchableOpacity>

            <View style={tw`flex-1`}>
              <Text style={tw`text-amber-400 font-bold text-lg`}>{item.tipe}</Text>
              <Text style={tw`text-gray-400`}>{item.jenis_mood} | {item.tanggal}</Text>
            </View>

            <View style={tw`flex-row`}>
              <TouchableOpacity
                style={tw`bg-yellow-500 rounded-xl px-3 py-1 mr-2`}
                onPress={() => handleEdit(item)}
              >
                <Text>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`bg-red-600 rounded-xl px-3 py-1`}
                onPress={() => handleDelete(item.id)}
              >
                <Text>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dropdown jenis mood */}
      <Modal
        visible={showJenisDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJenisDropdown(false)}
      >
        <TouchableOpacity
          style={tw`flex-1 bg-black bg-opacity-50 justify-center items-center`}
          activeOpacity={1}
          onPressOut={() => setShowJenisDropdown(false)}
        >
          <View style={tw`bg-gray-900 rounded-xl w-56`}>
            {jenisOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={tw`p-4 border-b border-gray-700`}
                onPress={() => {
                  if (dropdownSource === 'form') {
                    setForm(prev => ({ ...prev, jenis_mood: option }));
                  } else {
                    setForm(prev => ({ ...prev, jenis_mood: option }));
                  }
                  setShowJenisDropdown(false);
                }}
              >
                <Text style={tw`text-amber-400 text-center`}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Mood Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={tw`flex-1 bg-black bg-opacity-70 justify-center items-center p-6`}>
          <View style={tw`bg-gray-800 rounded-3xl p-6 w-full max-w-md`}>
            <Text style={tw`text-2xl font-bold mb-6 text-amber-500 text-center italic`}>Edit Mood</Text>

            <TextInput
              style={tw`border-2 border-amber-500 rounded-2xl p-4 mb-4 bg-gray-900 text-amber-400`}
              placeholder="Mood"
              value={form.tipe}
              onChangeText={text => handleChange('tipe', text)}
              placeholderTextColor="#FCD34D"
            />

            <TouchableOpacity
              style={tw`border-2 border-amber-500 rounded-2xl p-4 mb-4 bg-gray-900`}
              onPress={() => {
                setDropdownSource('modal');
                setShowJenisDropdown(true);
              }}
            >
              <Text style={tw`text-amber-400`}>{form.jenis_mood}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`border-2 border-amber-500 rounded-2xl p-4 mb-4 bg-gray-900 justify-center`}
              onPress={openDatePicker}
            >
              <Text style={tw`text-amber-400`}>{form.tanggal || 'Select Date (YYYY-MM-DD)'}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={form.tanggal ? new Date(form.tanggal) : new Date()}
                mode="date"
                display="default"
                onChange={onChangeDate}
                maximumDate={new Date(2100, 11, 31)}
                minimumDate={new Date(2000, 0, 1)}
              />
            )}

            <View style={tw`flex-row justify-between mt-4`}>
              <TouchableOpacity
                style={tw`bg-red-600 px-6 py-3 rounded-2xl`}
                onPress={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setForm({ tipe: '', jenis_mood: 'Select Mood Type', tanggal: '' });
                }}
              >
                <Text style={tw`text-gray-900 font-bold text-center`}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`bg-amber-600 px-6 py-3 rounded-2xl`}
                onPress={handleUpdate}
              >
                <Text style={tw`text-gray-900 font-bold text-center`}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        visible={confirmDelete.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDelete({ visible: false, id: null })}
      >
        <View style={tw`flex-1 bg-black bg-opacity-70 justify-center items-center p-6`}>
          <View style={tw`bg-gray-800 rounded-3xl p-6 w-full max-w-sm`}>
            <Text style={tw`text-amber-400 text-lg mb-6 text-center`}>
              Are you sure you want to delete this mood?
            </Text>
            <View style={tw`flex-row justify-around`}>
              <TouchableOpacity
                style={tw`bg-red-600 px-6 py-3 rounded-2xl`}
                onPress={() => setConfirmDelete({ visible: false, id: null })}
              >
                <Text style={tw`text-gray-900 font-bold text-center`}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`bg-amber-600 px-6 py-3 rounded-2xl`}
                onPress={confirmDeleteYes}
              >
                <Text style={tw`text-gray-900 font-bold text-center`}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm Edit Modal */}
      <Modal
        visible={confirmEdit.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmEdit({ visible: false, item: null })}
      >
        <View style={tw`flex-1 bg-black bg-opacity-70 justify-center items-center p-6`}>
          <View style={tw`bg-gray-800 rounded-3xl p-6 w-full max-w-sm`}>
            <Text style={tw`text-amber-400 text-lg mb-6 text-center`}>
              Are you sure you want to edit this mood?
            </Text>
            <View style={tw`flex-row justify-around`}>
              <TouchableOpacity
                style={tw`bg-red-600 px-6 py-3 rounded-2xl`}
                onPress={() => setConfirmEdit({ visible: false, item: null })}
              >
                <Text style={tw`text-gray-900 font-bold text-center`}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`bg-amber-600 px-6 py-3 rounded-2xl`}
                onPress={confirmEditYes}
              >
                <Text style={tw`text-gray-900 font-bold text-center`}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Validasi Gagal */}
      <Modal
        visible={modalValidasiGagal}
        transparent
        animationType="fade"
        onRequestClose={() => setModalValidasiGagal(false)}
      >
        <View style={tw`flex-1 bg-black bg-opacity-70 justify-center items-center p-6`}>
          <View style={tw`bg-gray-800 rounded-3xl p-6 w-full max-w-sm`}>
            <Text style={tw`text-amber-400 text-lg mb-6 text-center`}>
              Input tidak valid. Mood minimal 3 karakter, tanggal harus dalam format YYYY-MM-DD.
            </Text>
            <TouchableOpacity
              style={tw`bg-amber-600 px-6 py-3 rounded-2xl`}
              onPress={() => setModalValidasiGagal(false)}
            >
              <Text style={tw`text-gray-900 font-bold text-center`}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
