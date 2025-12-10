// iCloud sync using react-native-cloud-storage
// This provides full iCloud sync functionality using native iOS APIs

import { Person, Settings } from '@/types/events';
import { loadPeople, savePeople } from './storage';
import { loadSettings, saveSettings } from './storage';
import { ChecklistTemplate } from '@/types/checklist';
import { loadChecklistTemplates, saveChecklistTemplates } from './storage';

// Lazy load CloudStorage to avoid errors if module is not available
let CloudStorage: any = null;
let CloudStorageProvider: any = null;
let CloudStorageScope: any = null;
let moduleLoaded = false;

function loadCloudStorageModule() {
  if (moduleLoaded && CloudStorage) return true;
  
  try {
    const cloudStorageModule = require('react-native-cloud-storage');
    CloudStorage = cloudStorageModule.CloudStorage || cloudStorageModule.default;
    CloudStorageProvider = cloudStorageModule.CloudStorageProvider;
    CloudStorageScope = cloudStorageModule.CloudStorageScope;
    moduleLoaded = true;
    return CloudStorage !== null && CloudStorage !== undefined;
  } catch (error) {
    console.warn('Failed to load react-native-cloud-storage module:', error);
    moduleLoaded = true; // Mark as loaded even if failed to prevent repeated attempts
    return false;
  }
}

const PEOPLE_FILE = 'people.json';
const SETTINGS_FILE = 'settings.json';
const CHECKLIST_TEMPLATES_FILE = 'checklist_templates.json';

let syncEnabled = false;
let lastSyncDate: Date | null = null;

export interface CloudKitSyncStatus {
  syncing: boolean;
  lastSyncDate: Date | null;
  error?: string;
}

/**
 * Initialize iCloud sync
 */
export async function initializeICloud(): Promise<boolean> {
  try {
    // Load module if not already loaded
    if (!loadCloudStorageModule()) {
      console.warn('CloudStorage module is not available');
      return false;
    }
    
    // Check if CloudStorage is available
    if (!CloudStorage || typeof CloudStorage.getSupportedProviders !== 'function') {
      console.warn('CloudStorage module is not properly initialized');
      return false;
    }
    
    // Set provider to iCloud (iOS only)
    const supportedProviders = CloudStorage.getSupportedProviders();
    if (!supportedProviders || !supportedProviders.includes(CloudStorageProvider.ICloud)) {
      console.warn('iCloud is not supported on this platform');
      return false;
    }
    
    CloudStorage.setProvider(CloudStorageProvider.ICloud);
    CloudStorage.setProviderOptions({
      scope: CloudStorageScope.AppData,
    });
    
    // Check if iCloud is available
    const isAvailable = await CloudStorage.isCloudAvailable();
    if (!isAvailable) {
      console.warn('iCloud is not available. User may not be logged in.');
      return false;
    }
    
    syncEnabled = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize iCloud:', error);
    return false;
  }
}

/**
 * Enable or disable CloudKit sync
 */
export function setCloudKitEnabled(enabled: boolean) {
  syncEnabled = enabled;
}

/**
 * Check if CloudKit sync is enabled
 */
export function isCloudKitEnabled(): boolean {
  return syncEnabled;
}

/**
 * Save people to iCloud
 */
export async function savePeopleToICloud(people: Person[]): Promise<boolean> {
  if (!syncEnabled) return false;
  
  try {
    // Load module if not already loaded
    if (!loadCloudStorageModule() || !CloudStorage) {
      console.warn('CloudStorage module is not available');
      return false;
    }
    
    const isAvailable = await CloudStorage.isCloudAvailable();
    if (!isAvailable) {
      console.warn('iCloud is not available');
      return false;
    }
    
    const jsonData = JSON.stringify(people, null, 2);
    await CloudStorage.writeFile(PEOPLE_FILE, jsonData, CloudStorageScope.AppData);
    return true;
  } catch (error) {
    console.error('Failed to save people to iCloud:', error);
    return false;
  }
}

/**
 * Load people from iCloud
 */
export async function loadPeopleFromICloud(): Promise<Person[]> {
  if (!syncEnabled) return [];
  
  try {
    // Load module if not already loaded
    if (!loadCloudStorageModule() || !CloudStorage) {
      return [];
    }
    
    const isAvailable = await CloudStorage.isCloudAvailable();
    if (!isAvailable) {
      return [];
    }
    
    const exists = await CloudStorage.exists(PEOPLE_FILE, CloudStorageScope.AppData);
    if (!exists) {
      return [];
    }
    
    const content = await CloudStorage.readFile(PEOPLE_FILE, CloudStorageScope.AppData);
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to load people from iCloud:', error);
    return [];
  }
}

/**
 * Save settings to iCloud
 */
export async function saveSettingsToICloud(settings: Settings): Promise<boolean> {
  if (!syncEnabled) return false;
  
  try {
    // Load module if not already loaded
    if (!loadCloudStorageModule() || !CloudStorage) {
      return false;
    }
    
    const isAvailable = await CloudStorage.isCloudAvailable();
    if (!isAvailable) {
      return false;
    }
    
    const jsonData = JSON.stringify(settings, null, 2);
    await CloudStorage.writeFile(SETTINGS_FILE, jsonData, CloudStorageScope.AppData);
    return true;
  } catch (error) {
    console.error('Failed to save settings to iCloud:', error);
    return false;
  }
}

/**
 * Load settings from iCloud
 */
export async function loadSettingsFromICloud(): Promise<Settings | null> {
  if (!syncEnabled) return null;
  
  try {
    // Load module if not already loaded
    if (!loadCloudStorageModule() || !CloudStorage) {
      return null;
    }
    
    const isAvailable = await CloudStorage.isCloudAvailable();
    if (!isAvailable) {
      return null;
    }
    
    const exists = await CloudStorage.exists(SETTINGS_FILE, CloudStorageScope.AppData);
    if (!exists) {
      return null;
    }
    
    const content = await CloudStorage.readFile(SETTINGS_FILE, CloudStorageScope.AppData);
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to load settings from iCloud:', error);
    return null;
  }
}

/**
 * Save checklist templates to iCloud
 */
export async function saveChecklistTemplatesToICloud(templates: ChecklistTemplate[]): Promise<boolean> {
  if (!syncEnabled) return false;
  
  try {
    // Load module if not already loaded
    if (!loadCloudStorageModule() || !CloudStorage) {
      return false;
    }
    
    const isAvailable = await CloudStorage.isCloudAvailable();
    if (!isAvailable) {
      return false;
    }
    
    const jsonData = JSON.stringify(templates, null, 2);
    await CloudStorage.writeFile(CHECKLIST_TEMPLATES_FILE, jsonData, CloudStorageScope.AppData);
    return true;
  } catch (error) {
    console.error('Failed to save checklist templates to iCloud:', error);
    return false;
  }
}

/**
 * Load checklist templates from iCloud
 */
export async function loadChecklistTemplatesFromICloud(): Promise<ChecklistTemplate[]> {
  if (!syncEnabled) return [];
  
  try {
    // Load module if not already loaded
    if (!loadCloudStorageModule() || !CloudStorage) {
      return [];
    }
    
    const isAvailable = await CloudStorage.isCloudAvailable();
    if (!isAvailable) {
      return [];
    }
    
    const exists = await CloudStorage.exists(CHECKLIST_TEMPLATES_FILE, CloudStorageScope.AppData);
    if (!exists) {
      return [];
    }
    
    const content = await CloudStorage.readFile(CHECKLIST_TEMPLATES_FILE, CloudStorageScope.AppData);
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to load checklist templates from iCloud:', error);
    return [];
  }
}

/**
 * Perform full sync (merge local and iCloud data)
 */
export async function performFullSync(): Promise<CloudKitSyncStatus> {
  const status: CloudKitSyncStatus = {
    syncing: true,
    lastSyncDate: null,
  };
  
  try {
    if (!syncEnabled) {
      status.syncing = false;
      status.error = 'iCloud sync is not enabled';
      return status;
    }
    
    // Initialize iCloud if not already done
    const initialized = await initializeICloud();
    if (!initialized) {
      status.syncing = false;
      status.error = 'iCloud is not available';
      return status;
    }
    
    // Load from both sources
    const localPeople = await loadPeople();
    const cloudPeople = await loadPeopleFromICloud();
    const localSettings = await loadSettings();
    const cloudSettings = await loadSettingsFromICloud();
    const localChecklistTemplates = await loadChecklistTemplates();
    const cloudChecklistTemplates = await loadChecklistTemplatesFromICloud();
    
    // Merge people (prefer newer data)
    const mergedPeople = mergePeople(localPeople, cloudPeople);
    await savePeople(mergedPeople);
    await savePeopleToICloud(mergedPeople);
    
    // Merge settings (prefer cloud if exists, otherwise use local)
    const mergedSettings = cloudSettings || localSettings;
    if (mergedSettings) {
      await saveSettings(mergedSettings);
      await saveSettingsToICloud(mergedSettings);
    }
    
    // Merge checklist templates
    const mergedTemplates = mergeChecklistTemplates(localChecklistTemplates, cloudChecklistTemplates);
    await saveChecklistTemplates(mergedTemplates);
    await saveChecklistTemplatesToICloud(mergedTemplates);
    
    lastSyncDate = new Date();
    status.lastSyncDate = lastSyncDate;
    status.syncing = false;
    return status;
  } catch (error: any) {
    status.syncing = false;
    status.error = error.message || 'Sync failed';
    return status;
  }
}

/**
 * Merge people arrays with conflict resolution
 */
function mergePeople(local: Person[], cloud: Person[]): Person[] {
  const merged: Person[] = [];
  const seenIds = new Set<string>();
  
  // Add all people, preferring newer version
  [...local, ...cloud].forEach(person => {
    if (!seenIds.has(person.id)) {
      seenIds.add(person.id);
      merged.push(person);
    } else {
      // Update if cloud version is newer
      const existingIndex = merged.findIndex(p => p.id === person.id);
      if (existingIndex >= 0) {
        const existing = merged[existingIndex];
        const existingDate = new Date(existing.updatedAt || 0);
        const newDate = new Date(person.updatedAt || 0);
        if (newDate > existingDate) {
          merged[existingIndex] = person;
        }
      }
    }
  });
  
  return merged;
}

/**
 * Merge checklist templates arrays with conflict resolution
 */
function mergeChecklistTemplates(local: ChecklistTemplate[], cloud: ChecklistTemplate[]): ChecklistTemplate[] {
  const merged: ChecklistTemplate[] = [];
  const seenIds = new Set<string>();
  
  // Add all templates, preferring newer version
  [...local, ...cloud].forEach(template => {
    if (!seenIds.has(template.id)) {
      seenIds.add(template.id);
      merged.push(template);
    } else {
      // Update if cloud version is newer
      const existingIndex = merged.findIndex(t => t.id === template.id);
      if (existingIndex >= 0) {
        const existing = merged[existingIndex];
        const existingDate = new Date(existing.updatedAt || 0);
        const newDate = new Date(template.updatedAt || 0);
        if (newDate > existingDate) {
          merged[existingIndex] = template;
        }
      }
    }
  });
  
  return merged;
}

/**
 * Get sync status
 */
export function getSyncStatus(): CloudKitSyncStatus {
  return {
    syncing: false,
    lastSyncDate,
  };
}
