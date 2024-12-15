<script lang="ts">
  import { onMount } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { Switch } from '$lib/components/ui/switch';
  import { Label } from '$lib/components/ui/label';
  import { Button } from '$lib/components/ui/button';
  import { getAuth } from 'firebase/auth';
  import { doc, updateDoc, getDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import {
    Bell,
    Volume2,
    Moon,
    Shield,
    HelpCircle,
    FileText,
    ExternalLink
  } from 'lucide-svelte';

  let settings = {
    notifications: {
      newRides: true,
      rideUpdates: true,
      earnings: true
    },
    preferences: {
      darkMode: false,
      sound: true,
      autoAccept: false
    }
  };

  onMount(async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const driverDoc = await getDoc(doc(db, 'drivers', user.uid));
      if (driverDoc.exists() && driverDoc.data().settings) {
        settings = { ...settings, ...driverDoc.data().settings };
      }
    }
  });

  async function updateSettings() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, 'drivers', user.uid), {
          settings
        });
      } catch (error) {
        console.error('Error updating settings:', error);
      }
    }
  }
</script>

<div class="space-y-6">
  <!-- Notifications -->
  <Card class="p-6">
    <h2 class="text-lg font-semibold mb-4 flex items-center">
      <Bell class="w-5 h-5 mr-2" />
      Notifications
    </h2>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <Label for="newRides">New Ride Alerts</Label>
        <Switch
          id="newRides"
          checked={settings.notifications.newRides}
          onCheckedChange={(checked) => {
            settings.notifications.newRides = checked;
            updateSettings();
          }}
        />
      </div>
      <div class="flex items-center justify-between">
        <Label for="rideUpdates">Ride Updates</Label>
        <Switch
          id="rideUpdates"
          checked={settings.notifications.rideUpdates}
          onCheckedChange={(checked) => {
            settings.notifications.rideUpdates = checked;
            updateSettings();
          }}
        />
      </div>
      <div class="flex items-center justify-between">
        <Label for="earnings">Earnings Reports</Label>
        <Switch
          id="earnings"
          checked={settings.notifications.earnings}
          onCheckedChange={(checked) => {
            settings.notifications.earnings = checked;
            updateSettings();
          }}
        />
      </div>
    </div>
  </Card>

  <!-- Preferences -->
  <Card class="p-6">
    <h2 class="text-lg font-semibold mb-4 flex items-center">
      <Volume2 class="w-5 h-5 mr-2" />
      App Preferences
    </h2>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <Label for="darkMode">Dark Mode</Label>
        <Switch
          id="darkMode"
          checked={settings.preferences.darkMode}
          onCheckedChange={(checked) => {
            settings.preferences.darkMode = checked;
            updateSettings();
          }}
        />
      </div>
      <div class="flex items-center justify-between">
        <Label for="sound">Sound Effects</Label>
        <Switch
          id="sound"
          checked={settings.preferences.sound}
          onCheckedChange={(checked) => {
            settings.preferences.sound = checked;
            updateSettings();
          }}
        />
      </div>
      <div class="flex items-center justify-between">
        <Label for="autoAccept">Auto-accept Rides</Label>
        <Switch
          id="autoAccept"
          checked={settings.preferences.autoAccept}
          onCheckedChange={(checked) => {
            settings.preferences.autoAccept = checked;
            updateSettings();
          }}
        />
      </div>
    </div>
  </Card>

  <!-- Support & Help -->
  <Card class="p-6">
    <h2 class="text-lg font-semibold mb-4 flex items-center">
      <HelpCircle class="w-5 h-5 mr-2" />
      Support & Help
    </h2>
    <div class="space-y-2">
      <Button variant="outline" class="w-full justify-start" on:click={() => {}}>
        <Shield class="w-4 h-4 mr-2" />
        Safety Center
      </Button>
      <Button variant="outline" class="w-full justify-start" on:click={() => {}}>
        <FileText class="w-4 h-4 mr-2" />
        Terms of Service
      </Button>
      <Button variant="outline" class="w-full justify-start" on:click={() => {}}>
        <ExternalLink class="w-4 h-4 mr-2" />
        Contact Support
      </Button>
    </div>
  </Card>

  <!-- App Info -->
  <div class="text-center text-sm text-muted-foreground">
    <p>App Version 1.0.0</p>
    <p class="mt-1">© 2024 RideShare. All rights reserved.</p>
  </div>
</div>
