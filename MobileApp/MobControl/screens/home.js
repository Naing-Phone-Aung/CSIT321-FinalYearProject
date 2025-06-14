// screens/home.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { useNavigation } from '@react-navigation/native';
import { loadLayouts, saveLayouts, createDefaultLayout } from '../services/LayoutService';
import EditLayoutModal from '../components/EditLayoutName';
import ConfirmationModal from '../components/Confirmation';

const LayoutCard = ({ layout, onEdit, onDelete, navigation }) => {
  const { theme } = useSettings();
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Gamepad', { layout })}>
      <View style={[styles.imagePlaceholder, { backgroundColor: '#000' }]}>
        <Text style={{color: '#555'}}>Layout Preview Area</Text>
      </View>
      <View style={styles.cardActions}>
        <Text style={[styles.layoutName, { color: theme.colors.text }]}>{layout.name}</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.colors.separator }]} onPress={() => onEdit(layout)}>
            <Feather name="edit-2" size={16} color={theme.colors.text} />
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.deleteButton, { backgroundColor: theme.colors.destructiveBackground }]} onPress={() => onDelete(layout)}>
            <Feather name="trash-2" size={16} color="#D32F2F" />
            <Text style={[styles.buttonText, { color: '#D32F2F' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme } = useSettings();
  const [layouts, setLayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingLayout, setEditingLayout] = useState(null);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingLayout, setDeletingLayout] = useState(null);

  useEffect(() => {
    const fetchLayouts = async () => {
      try {
        const savedLayouts = await loadLayouts();
        setLayouts(savedLayouts);
      } catch (error) {
        console.error("Failed to fetch layouts from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLayouts();
  }, []);

  const handleOpenAddModal = () => setAddModalVisible(true);
  const handleCloseAddModal = () => setAddModalVisible(false);
  const handleConfirmAddNewLayout = async (name) => {
    const newLayout = { ...createDefaultLayout(), name: name };
    const updatedLayouts = [...layouts, newLayout];
    setLayouts(updatedLayouts);
    await saveLayouts(updatedLayouts);
    handleCloseAddModal();
    navigation.navigate('Gamepad', { layout: newLayout });
  };
  const handleOpenEditModal = (layout) => { setEditingLayout(layout); setEditModalVisible(true); };
  const handleCloseEditModal = () => setEditModalVisible(false);
  const handleSaveLayoutName = async (newName) => {
    const updatedLayouts = layouts.map(l => (l.id === editingLayout.id ? { ...l, name: newName } : l));
    setLayouts(updatedLayouts);
    await saveLayouts(updatedLayouts);
    handleCloseEditModal();
  };
  const handleOpenDeleteModal = (layout) => { setDeletingLayout(layout); setDeleteModalVisible(true); };
  const handleCloseDeleteModal = () => setDeleteModalVisible(false);
  const handleConfirmDelete = async () => {
    const updatedLayouts = layouts.filter(l => l.id !== deletingLayout.id);
    setLayouts(updatedLayouts);
    await saveLayouts(updatedLayouts);
    handleCloseDeleteModal();
  };

  if (isLoading) {
    return <View style={[styles.safeArea, {justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background}]}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>Mob Controller</Text>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Custom Layouts</Text>
          <TouchableOpacity style={[styles.newLayoutButton, { backgroundColor: theme.colors.primary }]} onPress={handleOpenAddModal}>
            <Feather name="plus" size={20} color="#FFF" />
            <Text style={styles.newLayoutButtonText}>New custom layout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Layouts</Text>
          {layouts.map((layout, index) => (
            <View key={layout.id} style={{ marginBottom: index === layouts.length - 1 ? 0 : 20 }}>
              <LayoutCard layout={layout} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} navigation={navigation} />
            </View>
          ))}
        </View>
      </ScrollView>
      <EditLayoutModal
        visible={isAddModalVisible}
        onClose={handleCloseAddModal}
        onSave={handleConfirmAddNewLayout}
        initialValue="My New Layout"
        // Provide the custom text for creating
        title="Create New Layout"
        message="Please enter a name for your new layout."
      />      
      <EditLayoutModal
        visible={isEditModalVisible}
        onClose={handleCloseEditModal}
        onSave={handleSaveLayoutName}
        initialValue={editingLayout?.name}
        // No title/message props needed; it will use the defaults
      />      
    <ConfirmationModal visible={isDeleteModalVisible} onClose={handleCloseDeleteModal} onConfirm={handleConfirmDelete} title="Delete Layout" message={`Are you sure you want to delete "${deletingLayout?.name}"?`} confirmButtonText="Delete" confirmButtonColor="#D32F2F" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  contentContainer: { padding: 20 },
  headerTitle: { fontFamily: 'Doto Thin', fontSize: 40, textAlign: 'center', marginBottom: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  newLayoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8 },
  newLayoutButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  cardContainer: { marginBottom: 20 },
  imagePlaceholder: { height: 180, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  layoutName: { fontSize: 16, fontWeight: '500' },
  editButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginLeft: 10 },
  buttonText: { marginLeft: 6, fontWeight: '500' },
});