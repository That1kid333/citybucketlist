<script lang="ts">
  import { page } from '$app/stores';
  import { getAuth, onAuthStateChanged } from 'firebase/auth';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Menu, X, Home, Clock, User, MapPin, Settings, LogOut } from 'lucide-svelte';

  let isMenuOpen = false;
  let isDriver = false;

  onMount(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        goto('/login');
        return;
      }
      // TODO: Check if user is a driver
      isDriver = true;
    });
  });

  const menuItems = [
    { href: '/driver', label: 'Home', icon: Home },
    { href: '/driver/rides', label: 'My Rides', icon: Clock },
    { href: '/driver/profile', label: 'Profile', icon: User },
    { href: '/driver/location', label: 'Location', icon: MapPin },
    { href: '/driver/settings', label: 'Settings', icon: Settings }
  ];

  function handleLogout() {
    const auth = getAuth();
    auth.signOut();
    goto('/login');
  }
</script>

<div class="min-h-screen bg-background">
  <!-- Mobile Header -->
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-14 items-center">
      <div class="mr-4">
        <Button variant="ghost" size="icon" on:click={() => isMenuOpen = !isMenuOpen}>
          {#if isMenuOpen}
            <X class="h-5 w-5" />
          {:else}
            <Menu class="h-5 w-5" />
          {/if}
        </Button>
      </div>
      <div class="flex-1">
        <h1 class="text-lg font-semibold">Driver Portal</h1>
      </div>
    </div>
  </header>

  <!-- Mobile Navigation Drawer -->
  {#if isMenuOpen}
    <div class="fixed inset-0 z-40 bg-background" transition:slide>
      <div class="container py-4">
        <nav class="space-y-2">
          {#each menuItems as item}
            <a
              href={item.href}
              class="flex items-center px-4 py-3 text-sm rounded-lg hover:bg-accent"
              class:bg-accent={$page.url.pathname === item.href}
              on:click={() => isMenuOpen = false}
            >
              <svelte:component this={item.icon} class="mr-3 h-5 w-5" />
              {item.label}
            </a>
          {/each}
          <button
            class="flex w-full items-center px-4 py-3 text-sm text-destructive hover:bg-destructive/10 rounded-lg"
            on:click={handleLogout}
          >
            <LogOut class="mr-3 h-5 w-5" />
            Logout
          </button>
        </nav>
      </div>
    </div>
  {/if}

  <!-- Main Content -->
  <main class="container py-4">
    <slot />
  </main>
</div>

<style>
  /* Add any custom styles here */
</style>
