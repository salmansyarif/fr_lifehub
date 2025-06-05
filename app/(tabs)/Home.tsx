import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import tw from 'twrnc';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function index() {
  const [form, setForm] = useState({
    kegiatan: '',
    jenis_kegiatan: 'Select Activity Type',
    tanggal: '',
  });

  const [kegiatan, setKegiatan] = useState([]);
  const [showJenisDropdown, setShowJenisDropdown] = useState(false);
  const [dropdownSource, setDropdownSource] = useState<'form' | 'modal'>('form');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [filterType, setFilterType] = useState('All');
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ visible: false, id: null });
  const [confirmEdit, setConfirmEdit] = useState({ visible: false, item: null });
  const [modalValidasiGagal, setModalValidasiGagal] = useState(false);

  // State untuk filter tanggal
  const [filterDate, setFilterDate] = useState<string>(''); 
  const [showFilterDatePicker, setShowFilterDatePicker] = useState(false);

  const jenisOptions = ['Pribadi', 'Kerja', 'Belajar'];

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  // Load activities from API
  const getKegiatan = async () => {
    try {
      const response = await fetch('http://10.0.2.2:8000/api/lifehub');
      const data = await response.json();
      setKegiatan(data);
      // Restore checked states
      const storedChecked = await AsyncStorage.getItem('checkedItems');
      if (storedChecked) {
        const parsedChecked = JSON.parse(storedChecked);
        const validChecked = Object.fromEntries(
          Object.entries(parsedChecked).filter(([key]) => data.some((item: any) => item.id === Number(key)))
        );
        setCheckedItems(validChecked);
      } else {
        setCheckedItems({});
      }
    } catch (error) {
      console.error('Error fetching:', error);
    }
  };

  useEffect(() => {
    getKegiatan();
  }, []);

  // Filter kegiatan by jenis_kegiatan and tanggal
  const filteredKegiatan = kegiatan.filter((item: any) => {
    const jenisMatch = filterType === 'All' || item.jenis_kegiatan === filterType;
    const dateMatch = !filterDate || item.tanggal === filterDate;
    return jenisMatch && dateMatch;
  });

  // Toggle checkbox and persist state in AsyncStorage
  const toggleCheckbox = async (id: number) => {
    const updatedChecked = {
      ...checkedItems,
      [id]: !checkedItems[id],
    };
    setCheckedItems(updatedChecked);
    try {
      await AsyncStorage.setItem('checkedItems', JSON.stringify(updatedChecked));
    } catch (error) {
      console.error('Error saving checkbox state:', error);
    }
  };

  const handleDelete = (id: number) => {
    setConfirmDelete({ visible: true, id });
  };

  const confirmDeleteYes = async () => {
    if (!confirmDelete.id) return;
    try {
      await fetch(`http://10.0.2.2:8000/api/lifehub/${confirmDelete.id}`, {
        method: 'DELETE',
      });
      await getKegiatan();
      const updatedChecked = { ...checkedItems };
      delete updatedChecked[confirmDelete.id];
      setCheckedItems(updatedChecked);
      await AsyncStorage.setItem('checkedItems', JSON.stringify(updatedChecked));
    } catch (error) {
      console.error('Error deleting:', error);
    }
    setConfirmDelete({ visible: false, id: null });
  };

  const handleEdit = (item: any) => {
    setConfirmEdit({ visible: true, item });
  };

  const confirmEditYes = () => {
    if (!confirmEdit.item) return;
    setEditingItem(confirmEdit.item);
    setForm({
      kegiatan: confirmEdit.item.kegiatan,
      jenis_kegiatan: confirmEdit.item.jenis_kegiatan,
      tanggal: confirmEdit.item.tanggal,
    });
    setShowEditModal(true);
    setConfirmEdit({ visible: false, item: null });
  };

  const validateForm = () => {
    if (form.kegiatan.length < 3) {
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

  const handleSubmit = async () => {
    try {
      if (!form.kegiatan || !form.jenis_kegiatan || !form.tanggal) {
        alert('All fields are required');
        return;
      }

      if (!validateForm()) return;

      await fetch('http://10.0.2.2:8000/api/lifehub', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      getKegiatan();
      setForm({
        kegiatan: '',
        jenis_kegiatan: 'Select Activity Type',
        tanggal: '',
      });
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      if (!editingItem) return;
      if (!validateForm()) return;

      await fetch(`http://10.0.2.2:8000/api/lifehub/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      getKegiatan();
      setShowEditModal(false);
      setEditingItem(null);
      setForm({
        kegiatan: '',
        jenis_kegiatan: 'Select Activity Type',
        tanggal: '',
      });
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().slice(0, 10);
      handleChange('tanggal', formattedDate);
    }
  };

  // Open dan tangani DatePicker filter tanggal
  const openFilterDatePicker = () => {
    setShowFilterDatePicker(true);
  };

  const onChangeFilterDate = (event: any, selectedDate?: Date) => {
    setShowFilterDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().slice(0, 10);
      setFilterDate(formattedDate);
    }
  };

  const clearFilterDate = () => {
    setFilterDate('');
  };

  return (
    <View style={tw`flex-1 bg-gray-900 p-6`}>
      <Text style={tw`text-3xl font-bold mb-6 mt-11 text-amber-500 text-center italic`}>Daily Activities</Text>

      <View style={tw`bg-gray-800 rounded-3xl p-6 shadow-xl mb-6`}>
        <TextInput
          style={tw`border-2 border-amber-500 rounded-2xl p-4 mb-4 bg-gray-900 text-amber-400`}
          placeholder="What's your activity?"
          value={form.kegiatan}
          onChangeText={(text) => handleChange('kegiatan', text)}
          placeholderTextColor="#FCD34D"
        />

        <TouchableOpacity
          style={tw`border-2 border-amber-500 rounded-2xl p-4 mb-4 bg-gray-900`}
          onPress={() => {
            setDropdownSource('form');
            setShowJenisDropdown(true);
          }}
        >
          <Text style={tw`text-amber-400`}>{form.jenis_kegiatan}</Text>
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
          style={tw`${form.kegiatan && form.jenis_kegiatan !== 'Select Activity Type' && form.tanggal ? 'bg-amber-600' : 'bg-gray-600'} p-4 rounded-2xl shadow-lg`}
          onPress={handleSubmit}
          disabled={!form.kegiatan || form.jenis_kegiatan === 'Select Activity Type' || !form.tanggal}
        >
          <Text style={tw`text-gray-900 text-center font-bold text-lg`}>Add Activity</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={tw`flex-1`}>
        <Text style={tw`text-2xl font-bold mb-4 text-amber-500 text-center italic`}>Activity List</Text>

        <View style={tw`mb-4 px-4`}>
          <Text style={tw`text-amber-400 font-semibold text-center`}>
            Total: {filteredKegiatan.length} | Completed: {filteredKegiatan.filter((item: any) => checkedItems[item.id]).length} | Pending: {filteredKegiatan.filter((item: any) => !checkedItems[item.id]).length}
          </Text>
        </View>

        {/* Filter jenis kegiatan */}
        <View style={tw`flex-row justify-center mb-2`}>
          <TouchableOpacity
            style={tw`${filterType === 'All' ? 'bg-amber-600' : 'bg-gray-800'} px-4 py-2 rounded-l-xl border border-amber-500`}
            onPress={() => setFilterType('All')}
          >
            <Text style={tw`${filterType === 'All' ? 'text-gray-900' : 'text-amber-400'} font-bold`}>All</Text>
          </TouchableOpacity>
          {jenisOptions.map((option, i) => (
            <TouchableOpacity
              key={option}
              style={tw`${filterType === option ? 'bg-amber-600' : 'bg-gray-800'} px-4 py-2 ${i === jenisOptions.length - 1 ? 'rounded-r-xl' : ''} border border-l-0 border-amber-500`}
              onPress={() => setFilterType(option)}
            >
              <Text style={tw`${filterType === option ? 'text-gray-900' : 'text-amber-400'} font-bold`}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filter by Date */}
        <View style={tw`flex-row justify-center mb-6 items-center`}>
          <TouchableOpacity
            style={tw`border-2 border-amber-500 rounded-2xl px-4 py-2 bg-gray-800`}
            onPress={openFilterDatePicker}
          >
            <Text style={tw`text-amber-400`}>
              {filterDate || 'Filter by Date (YYYY-MM-DD)'}
            </Text>
          </TouchableOpacity>

          {filterDate ? (
            <TouchableOpacity
              style={tw`ml-4 bg-red-700 px-4 py-2 rounded-2xl`}
              onPress={clearFilterDate}
            >
              <Text style={tw`text-gray-900 font-bold`}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {showFilterDatePicker && (
          <DateTimePicker
            value={filterDate ? new Date(filterDate) : new Date()}
            mode="date"
            display="default"
            onChange={onChangeFilterDate}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(2000, 0, 1)}
          />
        )}

        {filteredKegiatan.length === 0 ? (
          <Text style={tw`text-amber-400 text-center text-lg italic`}>No activities found.</Text>
        ) : (
          filteredKegiatan.map((item: any) => (
            <View key={item.id} style={tw`flex-row items-center border border-amber-600 rounded-xl p-4 mb-4 bg-gray-800`}>
              <TouchableOpacity
                style={tw`w-5 h-5 border border-amber-400 rounded mr-4 justify-center items-center`}
                onPress={() => toggleCheckbox(item.id)}
              >
                {checkedItems[item.id] && <View style={tw`w-3 h-3 bg-amber-400 rounded`} />}
              </TouchableOpacity>

              <View style={tw`flex-1`}>
                <Text style={tw`text-amber-400 font-bold text-base`}>{item.kegiatan}</Text>
                <Text style={tw`text-amber-400`}>{item.jenis_kegiatan} | {item.tanggal}</Text>
              </View>

              <TouchableOpacity
                style={tw`border border-amber-600 px-3 py-1 bg-amber-400 rounded-xl mr-2`}
                onPress={() => handleEdit(item)}
              >
                <Text style={tw`text-black-400`}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`border border-red-700 px-3 py-1 rounded-xl`}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={tw`text-red-700`}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Dropdown jenis kegiatan */}
      <Modal transparent visible={showJenisDropdown} animationType="fade">
        <TouchableOpacity
          style={tw`flex-1 bg-black bg-opacity-50 justify-center items-center`}
          onPress={() => setShowJenisDropdown(false)}
          activeOpacity={1}
        >
          <View style={tw`bg-gray-800 rounded-xl p-6 w-64`}>
            {jenisOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={tw`p-3 border-b border-amber-600`}
                onPress={() => {
                  handleChange('jenis_kegiatan', option);
                  setShowJenisDropdown(false);
                }}
              >
                <Text style={tw`text-amber-400 text-center`}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Edit */}
      <Modal transparent visible={showEditModal} animationType="slide">
        <View style={tw`flex-1 bg-black bg-opacity-75 justify-center items-center p-6`}>
          <View style={tw`bg-gray-800 rounded-xl p-6 w-full max-w-md`}>
            <TextInput
              style={tw`border-2 border-amber-500 rounded-2xl p-4 mb-4 bg-gray-900 text-amber-400`}
              value={form.kegiatan}
              onChangeText={(text) => handleChange('kegiatan', text)}
              placeholder="What's your activity?"
              placeholderTextColor="#FCD34D"
            />
            <TouchableOpacity
              style={tw`border-2 border-amber-500 rounded-2xl p-4 mb-4 bg-gray-900`}
              onPress={() => {
                setDropdownSource('modal');
                setShowJenisDropdown(true);
              }}
            >
              <Text style={tw`text-amber-400`}>{form.jenis_kegiatan}</Text>
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

            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity
                style={tw`bg-amber-600 p-4 rounded-2xl flex-1 mr-2`}
                onPress={handleUpdate}
              >
                <Text style={tw`text-gray-900 text-center font-bold`}>Update</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`bg-red-700 p-4 rounded-2xl flex-1 ml-2`}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={tw`text-gray-900 text-center font-bold`}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal konfirmasi hapus */}
      <Modal transparent visible={confirmDelete.visible} animationType="fade">
        <View style={tw`flex-1 bg-black bg-opacity-75 justify-center items-center p-6`}>
          <View style={tw`bg-gray-800 rounded-xl p-6 w-full max-w-xs`}>
            <Text style={tw`text-amber-400 mb-6 text-center text-lg`}>
              Are you sure you want to delete this activity?
            </Text>
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity
                style={tw`bg-red-700 p-4 rounded-2xl flex-1 mr-2`}
                onPress={confirmDeleteYes}
              >
                <Text style={tw`text-gray-900 text-center font-bold`}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`bg-gray-600 p-4 rounded-2xl flex-1 ml-2`}
                onPress={() => setConfirmDelete({ visible: false, id: null })}
              >
                <Text style={tw`text-amber-400 text-center font-bold`}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal konfirmasi edit */}
      <Modal transparent visible={confirmEdit.visible} animationType="fade">
        <View style={tw`flex-1 bg-black bg-opacity-75 justify-center items-center p-6`}>
          <View style={tw`bg-gray-800 rounded-xl p-6 w-full max-w-xs`}>
            <Text style={tw`text-amber-400 mb-6 text-center text-lg`}>
              Are you sure you want to edit this activity?
            </Text>
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity
                style={tw`bg-amber-600 p-4 rounded-2xl flex-1 mr-2`}
                onPress={confirmEditYes}
              >
                <Text style={tw`text-gray-900 text-center font-bold`}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`bg-gray-600 p-4 rounded-2xl flex-1 ml-2`}
                onPress={() => setConfirmEdit({ visible: false, item: null })}
              >
                <Text style={tw`text-amber-400 text-center font-bold`}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal validasi gagal */}
      <Modal transparent visible={modalValidasiGagal} animationType="fade">
        <View style={tw`flex-1 bg-black bg-opacity-75 justify-center items-center p-6`}>
          <View style={tw`bg-red-700 rounded-xl p-6 w-full max-w-xs`}>
            <Text style={tw`text-gray-900 mb-6 text-center text-lg`}>
              Validation failed! Make sure activity name is at least 3 characters and date is in YYYY-MM-DD format.
            </Text>
            <TouchableOpacity
              style={tw`bg-gray-900 p-4 rounded-2xl`}
              onPress={() => setModalValidasiGagal(false)}
            >
              <Text style={tw`text-amber-400 text-center font-bold`}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
