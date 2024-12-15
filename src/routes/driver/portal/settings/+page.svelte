<script lang="ts">
  import { getAuth } from 'firebase/auth';
  import { getFirestore, doc, updateDoc, onSnapshot } from 'firebase/firestore';
  import { onMount } from 'svelte';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Switch } from '$lib/components/ui/switch';
  import { Button } from '$lib/components/ui/button';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
  import { Bell, Moon, Volume2 } from 'lucide-svelte';

  let settings = {
    notifications: {
      newRides: true,
      rideUpdates: true,
      earnings: true
    },
    appearance: {
      theme: 'system',
      soundEnabled: true
    },
    support: {
      email: 'support@example.com',
      phone: '1-800-123-4567'
    }
  };

  onMount(() => {
    const auth = getAuth();
    const db = getFirestore();

    if (auth.currentUser) {
      const settingsDoc = doc(db, 'drivers', auth.currentUser.uid, 'settings', 'preferences');
      
      // Subscribe to settings updates
      onSnapshot(settingsDoc, (doc) => {
        if (doc.exists()) {
          settings = { ...settings, ...doc.data() };
        }
      });
    }
  });

  async function updateSettings(path: string[], value: any) {
    const auth = getAuth();
    const db = getFirestore();

    if (auth.currentUser) {
      const settingsDoc = doc(db, 'drivers', auth.currentUser.uid, 'settings', 'preferences');
      
      // Create update object with nested path
      const update = path.reduceRight((acc, key) => ({ [key]: acc }), value);
      
      await updateDoc(settingsDoc, update);
    }
  }
</script>

<div class="space-y-6">
  <!-- Notifications -->
  <Card>
    <CardHeader>
      <CardTitle>Notifications</CardTitle>
      <CardDescription>Manage your notification preferences</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <div class="flex items-center space-x-2">
            <Bell class="h-4 w-4" />
            <span class="font-medium">New Ride Alerts</span>
          </div>
          <p class="text-sm text-muted-foreground">
            Receive notifications for new ride requests
          </p>
        </div>
        <Switch
          checked={settings.notifications.newRides}
          on:click={() => updateSettings(['notifications', 'newRides'], !settings.notifications.newRides)}
        />
      </div>
      
      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <span class="font-medium">Ride Updates</span>
          <p class="text-sm text-muted-foreground">
            Get notified about changes to your scheduled rides
          </p>
        </div>
        <Switch
          checked={settings.notifications.rideUpdates}
          on:click={() => updateSettings(['notifications', 'rideUpdates'], !settings.notifications.rideUpdates)}
        />
      </div>

      <div class="flex items-center justify-between">
        <div class="space-y-0.5">
          <span class="font-medium">Earnings Reports</span>
          <p class="text-sm text-muted-foreground">
            Receive daily and weekly earnings summaries
          </p>
        </div>
        <Switch
          checked={settings.notifications.earnings}
          on:click={() => updateSettings(['notifications', 'earnings'], !settings.notifications.earnings)}
        />
      </div>
    </CardContent>
  </Card>

  <!-- Appearance -->
  <Card>
    <CardHeader>
      <CardTitle>Appearance</CardTitle>
      <CardDescription>Customize your app experience</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <Moon class="h-4 w-4" />
          <span class="font-medium">Theme</span>
        </div>
        <Select
          value={settings.appearance.theme}
          on:change={(e) => updateSettings(['appearance', 'theme'], e.detail)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <Volume2 class="h-4 w-4" />
          <span class="font-medium">Sound Effects</span>
        </div>
        <Switch
          checked={settings.appearance.soundEnabled}
          on:click={() => updateSettings(['appearance', 'soundEnabled'], !settings.appearance.soundEnabled)}
        />
      </div>
    </CardContent>
  </Card>

  <!-- Support -->
  <Card>
    <CardHeader>
      <CardTitle>Support</CardTitle>
      <CardDescription>Get help when you need it</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <p class="font-medium">Contact Support</p>
        <p class="text-sm text-muted-foreground">
          Email: {settings.support.email}<br />
          Phone: {settings.support.phone}
        </p>
      </div>
      <div class="flex space-x-2">
        <Button variant="outline" class="flex-1">
          Email Support
        </Button>
        <Button variant="outline" class="flex-1">
          Call Support
        </Button>
      </div>
    </CardContent>
  </Card>
</div>
