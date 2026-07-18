import React, { useState, useEffect } from 'react';
import ConfirmModal from './features/shared/ConfirmModal';
import AIChatbot from './features/ai/AIChatbot';
import GamificationWheel from './features/gamification/GamificationWheel';
import ReviewsSection from './features/reviews/ReviewsSection';
import SupportPortal from './features/support/SupportPortal';
import DeliveryPortal from './features/delivery/DeliveryPortal';
import AnalyticsDashboard from './features/analytics/AnalyticsDashboard';


// DTO and Entity Types
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  walletBalance?: number;
}

interface FoodItem {
  id?: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

interface CartItemDto {
  id: number;
  userId: number;
  foodId: number;
  quantity: number;
  food: FoodItem | null;
}

interface OrderItemDto {
  foodId: number;
  foodName: string;
  quantity: number;
  price: number;
}

interface OrderDetailDto {
  id: number;
  userId: number;
  items: OrderItemDto[];
  totalAmount: number;
  status: string;
  orderType?: string;
  scheduledTime?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  walletAmountPaid?: number;
  otherAmountPaid?: number;
  corporateName?: string;
  groupOrderId?: string;
  notes?: string;
}

interface Transaction {
  id: number;
  userId: number;
  orderId?: number;
  amount: number;
  paymentMethod: string;
  type: string; // PAYMENT, REFUND, WALLET_ADD
  status: string; // SUCCESS, FAILED
  timestamp: string;
}

interface Offer {
  id?: number;
  title: string;
  description: string;
  code: string;
  discount: number;
  tag: string;
  icon: string;
}

interface Restaurant {
  id?: number;
  name: string;
  cuisineType: string;
  address: string;
  rating: number;
  activeStatus: boolean;
  commissionRate: number;
}

interface Rider {
  id?: number;
  name: string;
  phone: string;
  status: string;
  activeDeliveryCount: number;
  vehicleType: string;
}

interface City {
  id?: number;
  name: string;
  state: string;
  activeStatus: boolean;
}

interface Category {
  id?: number;
  name: string;
  icon: string;
}

interface Announcement {
  id?: number;
  title: string;
  message: string;
  timestamp: string;
}


const API_BASE = 'http://localhost:8080/api';

// Categories with high quality food icons & images
const FOOD_CATEGORIES = [
  { name: 'Biryani', icon: '🍲', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=150&auto=format&fit=crop&q=60' },
  { name: 'Pizza', icon: '🍕', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=60' },
  { name: 'Burgers', icon: '🍔', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=60' },
  { name: 'Desserts', icon: '🍰', img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&auto=format&fit=crop&q=60' },
  { name: 'Chinese', icon: '🍜', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=150&auto=format&fit=crop&q=60' },
  { name: 'Drinks', icon: '🥤', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=150&auto=format&fit=crop&q=60' }
];

export default function App() {
  // Session & Navigation States
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<string>('home'); // 'home' | 'offers' | 'cart' | 'my-orders' | 'shop-dashboard' | 'delivery-rider' | 'customer-support'
  const [loading, setLoading] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Data States
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [cart, setCart] = useState<CartItemDto[]>([]);
  const [myOrders, setMyOrders] = useState<OrderDetailDto[]>([]);
  const [adminOrders, setAdminOrders] = useState<OrderDetailDto[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  
  // Marketing & Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [under200, setUnder200] = useState<boolean>(false);
  const [highRated, setHighRated] = useState<boolean>(false);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [activeReviewsFoodId, setActiveReviewsFoodId] = useState<number | null>(null);

  // Auth Modals State
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authAsMerchant, setAuthAsMerchant] = useState<boolean>(false);

  // Custom Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  // Shop Owner Modals & Tab
  const [showFoodModal, setShowFoodModal] = useState<boolean>(false);
  const [showOfferModal, setShowOfferModal] = useState<boolean>(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  // Admin Data Lists States
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminRestaurants, setAdminRestaurants] = useState<Restaurant[]>([]);
  const [adminRiders, setAdminRiders] = useState<Rider[]>([]);
  const [adminCities, setAdminCities] = useState<City[]>([]);
  const [adminCategories, setAdminCategories] = useState<Category[]>([]);
  const [adminAnnouncements, setAdminAnnouncements] = useState<Announcement[]>([]);
  const [adminTransactions, setAdminTransactions] = useState<Transaction[]>([]);
  const [adminCommissionMetrics, setAdminCommissionMetrics] = useState<any>({
    globalCommissionRate: 15.0,
    totalDeliveredRevenue: 0,
    totalCommissionEarned: 0,
    totalRestaurants: 0
  });
  const [adminPendingRefunds, setAdminPendingRefunds] = useState<OrderDetailDto[]>([]);

  // Admin Modal & Sub-forms
  const [showRestaurantModal, setShowRestaurantModal] = useState<boolean>(false);
  const [showRiderModal, setShowRiderModal] = useState<boolean>(false);
  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState<boolean>(false);

  const [restaurantForm, setRestaurantForm] = useState({ name: '', cuisineType: '', address: '', commissionRate: '15' });
  const [riderForm, setRiderForm] = useState({ name: '', phone: '', vehicleType: 'BIKE' });
  const [cityForm, setCityForm] = useState({ name: '', state: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '🍔' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '' });

  // Admin API Fetchers
  const fetchAdminUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, { credentials: 'include' });
      if (res.ok) setAdminUsers(await res.json());
    } catch (e) {}
  };

  const fetchAdminRestaurants = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/restaurants`, { credentials: 'include' });
      if (res.ok) setAdminRestaurants(await res.json());
    } catch (e) {}
  };

  const fetchAdminRiders = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/riders`, { credentials: 'include' });
      if (res.ok) setAdminRiders(await res.json());
    } catch (e) {}
  };

  const fetchAdminCities = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/cities`, { credentials: 'include' });
      if (res.ok) setAdminCities(await res.json());
    } catch (e) {}
  };

  const fetchAdminCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/categories`, { credentials: 'include' });
      if (res.ok) setAdminCategories(await res.json());
    } catch (e) {}
  };

  const fetchAdminAnnouncements = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/announcements`);
      if (res.ok) setAdminAnnouncements(await res.json());
    } catch (e) {}
  };

  const fetchAdminTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/transactions`, { credentials: 'include' });
      if (res.ok) setAdminTransactions(await res.json());
    } catch (e) {}
  };

  const fetchAdminCommissionMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/commission`, { credentials: 'include' });
      if (res.ok) setAdminCommissionMetrics(await res.json());
    } catch (e) {}
  };

  const fetchAdminPendingRefunds = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/refunds/pending`, { credentials: 'include' });
      if (res.ok) setAdminPendingRefunds(await res.json());
    } catch (e) {}
  };

  const triggerAdminDataFetch = (tab: string) => {
    if (tab === 'dashboard') {
      fetchAdminCommissionMetrics();
      fetchAdminUsers();
      fetchAdminRestaurants();
      fetchAdminRiders();
      fetchAdminCities();
    } else if (tab === 'users') {
      fetchAdminUsers();
    } else if (tab === 'restaurants') {
      fetchAdminRestaurants();
    } else if (tab === 'riders') {
      fetchAdminRiders();
    } else if (tab === 'cities') {
      fetchAdminCities();
    } else if (tab === 'categories') {
      fetchAdminCategories();
    } else if (tab === 'announcements') {
      fetchAdminAnnouncements();
    } else if (tab === 'payments') {
      fetchAdminTransactions();
    } else if (tab === 'commission') {
      fetchAdminCommissionMetrics();
    } else if (tab === 'refunds') {
      fetchAdminPendingRefunds();
    } else if (tab === 'orders') {
      fetchAdminOrders();
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN' && page === 'shop-dashboard') {
      triggerAdminDataFetch(adminTab);
    }
  }, [adminTab, page, user]);


  // Input states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [foodForm, setFoodForm] = useState({ name: '', description: '', price: '', imageFile: null as File | null });
  const [offerForm, setOfferForm] = useState({ title: '', description: '', code: '', discount: '', tag: 'MOST POPULAR', icon: '🎉' });
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);

  // Checkout & Payment State Variables
  const [checkoutMode, setCheckoutMode] = useState<string>('INSTANT'); // 'INSTANT' | 'SCHEDULED' | 'GROUP' | 'BULK' | 'CORPORATE'
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [groupOrderId, setGroupOrderId] = useState<string>('');
  const [corporateName, setCorporateName] = useState<string>('');
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');

  const [paymentMethod, setPaymentMethod] = useState<string>('UPI'); // 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET' | 'COD' | 'SPLIT'
  const [upiId, setUpiId] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('SBI');
  const [walletAmountPaid, setWalletAmountPaid] = useState<number>(0);
  const [otherAmountPaid, setOtherAmountPaid] = useState<number>(0);
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);

  // Wallet and Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletAmountToAdd, setWalletAmountToAdd] = useState<string>('');

  // Payment Retry modal/panel
  const [retryOrder, setRetryOrder] = useState<OrderDetailDto | null>(null);
  const [retryPaymentMethod, setRetryPaymentMethod] = useState<string>('UPI');
  const [retryUpiId, setRetryUpiId] = useState<string>('');
  const [retryCardNumber, setRetryCardNumber] = useState<string>('');
  const [retryCardExpiry, setRetryCardExpiry] = useState<string>('');
  const [retryCardCvv, setRetryCardCvv] = useState<string>('');
  const [retrySelectedBank, setRetrySelectedBank] = useState<string>('SBI');

  // Group Order tracking state
  const [trackedGroupId, setTrackedGroupId] = useState<string>('');
  const [groupOrders, setGroupOrders] = useState<OrderDetailDto[]>([]);

  const fetchTransactions = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE}/payment/history/${userId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (e) {
      showToast('Error loading transactions', true);
    }
  };

  const handleAddWalletFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !walletAmountToAdd) return;
    const amount = parseFloat(walletAmountToAdd);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', true);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/payment/wallet/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amount, paymentMethod: 'UPI' }),
        credentials: 'include'
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setWalletAmountToAdd('');
        showToast(`Successfully added ₹${amount} to your wallet!`);
        fetchTransactions(user.id);
      } else {
        showToast('Error adding funds to wallet', true);
      }
    } catch (e) {
      showToast('Server error adding funds', true);
    }
  };

  const handleTrackGroupOrder = async () => {
    if (!trackedGroupId.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/orders/group/${trackedGroupId.trim()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setGroupOrders(data);
        if (data.length === 0) {
          showToast('No orders found for this Group ID', true);
        } else {
          showToast(`Found ${data.length} group orders!`);
        }
      } else {
        showToast('Error tracking group orders', true);
      }
    } catch (e) {
      showToast('Server error tracking group', true);
    }
  };

  const handleRepeatLastOrder = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/orders/repeat-last?userId=${user.id}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        showToast('Repeated last order successfully!');
        checkSession();
        setPage('my-orders');
        fetchMyOrders(user.id);
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to repeat last order', true);
      }
    } catch (e) {
      showToast('Error repeating last order', true);
    }
  };

  const handleReorderItems = async (items: OrderItemDto[]) => {
    if (!user) return;
    showToast('Adding items to cart for reorder...');
    for (const item of items) {
      try {
        await fetch(`${API_BASE}/cart/${user.id}/add/${item.foodId}`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch (e) {}
    }
    fetchCart(user.id);
    setPage('cart');
    showToast('Items added to cart for reordering!');
  };

  const handleRetryPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retryOrder || !user) return;
    
    let wPaid = 0;
    let oPaid = 0;
    const total = retryOrder.totalAmount;
    
    if (retryPaymentMethod === 'WALLET') {
      if ((user.walletBalance || 0) < total) {
        showToast('Insufficient wallet balance!', true);
        return;
      }
      wPaid = total;
    } else if (retryPaymentMethod === 'SPLIT') {
      const maxWallet = Math.min(user.walletBalance || 0, total);
      wPaid = maxWallet;
      oPaid = total - maxWallet;
    } else {
      oPaid = total;
    }
    
    try {
      const res = await fetch(`${API_BASE}/payment/retry/${retryOrder.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: retryPaymentMethod,
          walletAmountPaid: wPaid,
          otherAmountPaid: oPaid
        }),
        credentials: 'include'
      });
      if (res.ok) {
        showToast('Payment retried and completed successfully!');
        setRetryOrder(null);
        checkSession();
        fetchMyOrders(user.id);
      } else {
        const err = await res.json();
        showToast(err.error || 'Retry payment failed', true);
      }
    } catch (e) {
      showToast('Error retrying payment', true);
    }
  };

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const getImageUrl = (path?: string) => {
    if (!path) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:8080${path}`;
  };

  // Toggle dark/light theme
  useEffect(() => {
    const cachedTheme = localStorage.getItem('theme');
    if (cachedTheme === 'light') {
      setDarkMode(false);
      document.body.classList.add('light-mode');
    } else {
      setDarkMode(true);
      document.body.classList.remove('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  // Check user session
  const checkSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const currentUser = await res.json();
        setUser(currentUser);
        if (currentUser.role === 'ADMIN') {
          setPage('shop-dashboard');
          fetchAdminOrders();
        } else {
          setPage('home');
          fetchCart(currentUser.id);
        }
      } else {
        setPage('home');
      }
    } catch (e) {
      setPage('home');
    } finally {
      fetchFoods();
      fetchOffers();
      fetchAdminAnnouncements();
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // WebSockets real-time queue updater simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time fetch checking for both user orders tracker and admin queue
      if (user) {
        if (user.role === 'ADMIN' && page === 'shop-dashboard') {
          fetchAdminOrders();
        } else if (page === 'my-orders') {
          fetchMyOrders(user.id);
        }
      }
    }, 5000); // Pool every 5s for live real-time simulation
    return () => clearInterval(interval);
  }, [user, page]);

  const fetchFoods = async () => {
    try {
      const res = await fetch(`${API_BASE}/foods`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFoods(data);
      }
    } catch (e) {
      showToast('Error loading menu items', true);
    }
  };

  const fetchOffers = async () => {
    try {
      const res = await fetch(`${API_BASE}/offers`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setOffers(data);
      }
    } catch (e) {
      showToast('Error loading offers', true);
    }
  };

  const fetchCart = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE}/cart/${userId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (e) {
      showToast('Error loading cart', true);
    }
  };

  const fetchMyOrders = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE}/orders/user/${userId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMyOrders(data);
      }
    } catch (e) {
      showToast('Error loading orders', true);
    }
  };

  const fetchAdminOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders/admin/all`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAdminOrders(data);
      }
    } catch (e) {
      showToast('Error loading admin orders', true);
    }
  };

  // Login Process
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
        credentials: 'include'
      });
      if (res.ok) {
        const currentUser = await res.json();
        setUser(currentUser);
        setShowAuthModal(false);
        showToast(`Welcome back, ${currentUser.name}!`);
        if (currentUser.role === 'ADMIN') {
          setPage('shop-dashboard');
          fetchFoods();
          fetchOffers();
          fetchAdminOrders();
        } else {
          setPage('home');
          fetchFoods();
          fetchOffers();
          fetchCart(currentUser.id);
        }
      } else {
        const err = await res.json();
        showToast(err.error || 'Login failed', true);
      }
    } catch (e) {
      showToast('Server error during login', true);
    }
  };

  // Registration Process
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...registerForm,
      role: authAsMerchant ? 'ADMIN' : 'USER'
    };
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (res.ok) {
        showToast('Registration successful! Please log in.');
        setAuthMode('login');
        setLoginForm({ email: registerForm.email, password: '' });
      } else {
        const err = await res.json();
        showToast(err.error || 'Registration failed', true);
      }
    } catch (e) {
      showToast('Server error during registration', true);
    }
  };

  // Logout Process
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
      setUser(null);
      setCart([]);
      setMyOrders([]);
      setAdminOrders([]);
      setAppliedPromo(null);
      setPage('home');
      showToast('Logged out successfully');
    } catch (e) {
      showToast('Error logging out', true);
    }
  };

  // Add Item to Cart (Triggers Modal if Guest)
  const handleAddToCart = async (productId: number) => {
    if (!user) {
      setAuthAsMerchant(false);
      setAuthMode('login');
      setShowAuthModal(true);
      showToast('Please log in to add items to your cart.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/cart/${user.id}/add/${productId}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
        showToast('Item added to cart!');
      }
    } catch (e) {
      showToast('Could not add to cart', true);
    }
  };

  // Remove Item
  const handleRemoveFromCart = async (itemId: number) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/cart/remove/${itemId}/${user.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
        showToast('Item removed');
      }
    } catch (e) {
      showToast('Could not remove item', true);
    }
  };

  // Clear Cart
  const handleClearCart = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/cart/clear/${user.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
        setAppliedPromo(null);
        showToast('Cart cleared');
      }
    } catch (e) {
      showToast('Could not clear cart', true);
    }
  };

  const getCheckoutTotal = () => {
    let base = getGrandTotal();
    if (checkoutMode === 'BULK') {
      base = base * 0.85; // 15% discount
    } else if (checkoutMode === 'CORPORATE') {
      base = base * 0.90; // 10% discount
    }
    return Math.max(0, Math.round(base));
  };

  // Checkout / Place Order
  const handlePlaceOrder = async () => {
    if (!user) return;
    
    const checkoutTotal = getCheckoutTotal();
    
    let wPaid = 0;
    let oPaid = 0;
    
    if (paymentMethod === 'WALLET') {
      if ((user.walletBalance || 0) < checkoutTotal) {
        showToast('Insufficient wallet balance! Use split payment or add funds.', true);
        return;
      }
      wPaid = checkoutTotal;
    } else if (paymentMethod === 'SPLIT') {
      if (walletAmountPaid > (user.walletBalance || 0)) {
        showToast('Wallet split amount exceeds your current balance!', true);
        return;
      }
      if (walletAmountPaid + otherAmountPaid !== checkoutTotal) {
        showToast(`Split amounts (₹${walletAmountPaid} + ₹${otherAmountPaid}) must equal total (₹${checkoutTotal})`, true);
        return;
      }
      wPaid = walletAmountPaid;
      oPaid = otherAmountPaid;
    } else {
      oPaid = checkoutTotal;
    }
    
    const payload = {
      userId: user.id,
      orderType: checkoutMode,
      scheduledTime: checkoutMode === 'SCHEDULED' ? scheduledTime : null,
      paymentMethod: paymentMethod,
      paymentStatus: simulateFailure ? 'FAILED' : (paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED'),
      walletAmountPaid: wPaid,
      otherAmountPaid: oPaid,
      corporateName: checkoutMode === 'CORPORATE' ? corporateName : null,
      groupOrderId: checkoutMode === 'GROUP' ? groupOrderId : null,
      notes: checkoutNotes
    };
    
    try {
      const res = await fetch(`${API_BASE}/orders/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (res.ok) {
        if (simulateFailure) {
          showToast('Payment simulated failure! Order is in unpaid status.', true);
        } else {
          showToast('Order placed successfully!');
        }
        checkSession();
        setCart([]);
        setAppliedPromo(null);
        setPage('my-orders');
        fetchMyOrders(user.id);
        
        // Reset states
        setCheckoutMode('INSTANT');
        setScheduledTime('');
        setGroupOrderId('');
        setCorporateName('');
        setCheckoutNotes('');
        setSimulateFailure(false);
      } else {
        const err = await res.json();
        showToast(err.error || 'Checkout failed', true);
      }
    } catch (e) {
      showToast('Error during checkout', true);
    }
  };


  // Update Status (Shop Owner)
  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status?status=${status}`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (res.ok) {
        showToast(`Order #${orderId} updated to ${status}`);
        fetchAdminOrders();
      }
    } catch (e) {
      showToast('Error updating status', true);
    }
  };

  // --- ADMIN PANEL HANDLERS ---
  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/role?role=${newRole}`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (res.ok) {
        showToast(`User role updated to ${newRole}`);
        fetchAdminUsers();
      } else {
        showToast('Failed to update role', true);
      }
    } catch (e) {
      showToast('Error updating role', true);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        showToast('User deleted successfully');
        fetchAdminUsers();
      } else {
        showToast('Failed to delete user', true);
      }
    } catch (e) {
      showToast('Error deleting user', true);
    }
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: restaurantForm.name,
          cuisineType: restaurantForm.cuisineType,
          address: restaurantForm.address,
          commissionRate: parseFloat(restaurantForm.commissionRate) / 100,
          activeStatus: true,
          rating: 4.5
        }),
        credentials: 'include'
      });
      if (res.ok) {
        showToast('Restaurant added successfully!');
        setRestaurantForm({ name: '', cuisineType: '', address: '', commissionRate: '15' });
        setShowRestaurantModal(false);
        fetchAdminRestaurants();
      } else {
        showToast('Failed to add restaurant', true);
      }
    } catch (e) {
      showToast('Error adding restaurant', true);
    }
  };

  const handleToggleRestaurant = async (restaurant: Restaurant) => {
    try {
      const res = await fetch(`${API_BASE}/admin/restaurants/${restaurant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...restaurant,
          activeStatus: !restaurant.activeStatus
        }),
        credentials: 'include'
      });
      if (res.ok) {
        showToast(`Restaurant status toggled!`);
        fetchAdminRestaurants();
      }
    } catch (e) {}
  };

  const handleDeleteRestaurant = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/restaurants/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        showToast('Restaurant deleted!');
        fetchAdminRestaurants();
      }
    } catch (e) {}
  };

  const handleCreateRider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/riders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: riderForm.name,
          phone: riderForm.phone,
          vehicleType: riderForm.vehicleType,
          status: 'AVAILABLE',
          activeDeliveryCount: 0
        }),
        credentials: 'include'
      });
      if (res.ok) {
        showToast('Delivery Partner added!');
        setRiderForm({ name: '', phone: '', vehicleType: 'BIKE' });
        setShowRiderModal(false);
        fetchAdminRiders();
      } else {
        showToast('Failed to add partner', true);
      }
    } catch (e) {
      showToast('Error adding partner', true);
    }
  };

  const handleToggleRider = async (rider: Rider) => {
    try {
      const res = await fetch(`${API_BASE}/admin/riders/${rider.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...rider,
          status: rider.status === 'OFFLINE' ? 'AVAILABLE' : 'OFFLINE'
        }),
        credentials: 'include'
      });
      if (res.ok) {
        showToast(`Rider availability status changed!`);
        fetchAdminRiders();
      }
    } catch (e) {}
  };

  const handleDeleteRider = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/riders/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        showToast('Delivery partner deleted!');
        fetchAdminRiders();
      }
    } catch (e) {}
  };

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/cities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cityForm.name,
          state: cityForm.state,
          activeStatus: true
        }),
        credentials: 'include'
      });
      if (res.ok) {
        showToast('Operational city added!');
        setCityForm({ name: '', state: '' });
        setShowCityModal(false);
        fetchAdminCities();
      } else {
        showToast('Failed to add city', true);
      }
    } catch (e) {
      showToast('Error adding city', true);
    }
  };

  const handleToggleCity = async (city: City) => {
    try {
      const res = await fetch(`${API_BASE}/admin/cities/${city.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...city,
          activeStatus: !city.activeStatus
        }),
        credentials: 'include'
      });
      if (res.ok) {
        showToast(`City status updated!`);
        fetchAdminCities();
      }
    } catch (e) {}
  };

  const handleDeleteCity = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/cities/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        showToast('Operational city deleted!');
        fetchAdminCities();
      }
    } catch (e) {}
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryForm.name,
          icon: categoryForm.icon
        }),
        credentials: 'include'
      });
      if (res.ok) {
        showToast('Food Category added!');
        setCategoryForm({ name: '', icon: '🍔' });
        setShowCategoryModal(false);
        fetchAdminCategories();
      } else {
        showToast('Failed to add category', true);
      }
    } catch (e) {
      showToast('Error adding category', true);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        showToast('Food Category deleted!');
        fetchAdminCategories();
      }
    } catch (e) {}
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: announcementForm.title,
          message: announcementForm.message
        }),
        credentials: 'include'
      });
      if (res.ok) {
        showToast('Announcement broadcasted successfully!');
        setAnnouncementForm({ title: '', message: '' });
        setShowAnnouncementModal(false);
        fetchAdminAnnouncements();
      } else {
        showToast('Failed to broadcast announcement', true);
      }
    } catch (e) {
      showToast('Error broadcasting announcement', true);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/announcements/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        showToast('Announcement deleted!');
        fetchAdminAnnouncements();
      }
    } catch (e) {}
  };

  const handleUpdateGlobalCommission = async (rate: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/commission/global?rate=${rate}`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (res.ok) {
        showToast(`Global commission rate updated to ${rate}%`);
        fetchAdminCommissionMetrics();
      }
    } catch (e) {}
  };

  const handleApproveRefund = async (orderId: number) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status?status=REFUNDED`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (res.ok) {
        showToast(`Refund approved and balance returned to user wallet!`);
        fetchAdminPendingRefunds();
      } else {
        showToast('Failed to approve refund', true);
      }
    } catch (e) {
      showToast('Error approving refund', true);
    }
  };


  // Add/Edit Food Item
  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', foodForm.name);
      formData.append('description', foodForm.description);
      formData.append('price', foodForm.price);
      if (foodForm.imageFile) {
        formData.append('image', foodForm.imageFile);
      }

      let res;
      if (editingFood) {
        res = await fetch(`${API_BASE}/foods/${editingFood.id}`, {
          method: 'PUT',
          body: formData,
          credentials: 'include'
        });
      } else {
        res = await fetch(`${API_BASE}/foods`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
      }

      if (res.ok) {
        showToast(editingFood ? 'Food updated successfully!' : 'Food item added!');
        setShowFoodModal(false);
        setEditingFood(null);
        setFoodForm({ name: '', description: '', price: '', imageFile: null });
        fetchFoods();
      } else {
        showToast('Error saving food item', true);
      }
    } catch (e) {
      showToast('Server error saving food', true);
    }
  };

  // Custom Delete Confirmations
  const handleDeleteFoodWithConfirm = (foodId: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Menu Item?',
      message: 'Are you sure you want to permanently remove this food item from the menu?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/foods/${foodId}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          if (res.ok) {
            showToast('Food item deleted');
            fetchFoods();
          }
        } catch (e) {
          showToast('Error deleting item', true);
        }
        setConfirmModal(null);
      }
    });
  };

  const handleDeleteOfferWithConfirm = (offerId: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Coupon Offer?',
      message: 'Are you sure you want to permanently revoke this coupon discount offer?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/offers/${offerId}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          if (res.ok) {
            showToast('Promo offer deleted');
            fetchOffers();
          }
        } catch (e) {
          showToast('Error deleting offer', true);
        }
        setConfirmModal(null);
      }
    });
  };

  const openEditModal = (food: FoodItem) => {
    setEditingFood(food);
    setFoodForm({
      name: food.name,
      description: food.description,
      price: food.price.toString(),
      imageFile: null
    });
    setShowFoodModal(true);
  };

  // Dynamic Offer Create
  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...offerForm,
          discount: parseFloat(offerForm.discount)
        }),
        credentials: 'include'
      });
      if (res.ok) {
        showToast('Promo offer created successfully!');
        setShowOfferModal(false);
        setOfferForm({ title: '', description: '', code: '', discount: '', tag: 'MOST POPULAR', icon: '🎉' });
        fetchOffers();
      } else {
        showToast('Error creating coupon offer', true);
      }
    } catch (e) {
      showToast('Server error creating offer', true);
    }
  };

  // Pricing calculations with Promos
  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = item.food ? item.food.price : 0;
      return total + price * item.quantity;
    }, 0);
  };

  const getDiscountAmount = () => {
    if (!appliedPromo) return 0;
    return Math.round(getSubtotal() * appliedPromo.discount);
  };

  const getGrandTotal = () => {
    const total = getSubtotal() - getDiscountAmount();
    return total < 0 ? 0 : total;
  };

  const applyPromoCode = (code: string, discount: number) => {
    if (cart.length === 0) {
      showToast('Add items to cart before applying promo code', true);
      return;
    }
    setAppliedPromo({ code, discount });
    showToast(`Promo ${code} applied successfully!`);
    setPage('cart');
  };

  // KPI Computations for Admin

  const activeOrdersCount = adminOrders
    .filter(order => order.status.toUpperCase() !== 'DELIVERED')
    .length;

  // Filters logic
  const filteredFoods = foods.filter(food => {
    const matchesSearch = 
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      !selectedCategory || food.name.toLowerCase().includes(selectedCategory.toLowerCase()) || food.description.toLowerCase().includes(selectedCategory.toLowerCase());
    
    const isVeg = !food.name.toLowerCase().includes('chicken') && 
                  !food.name.toLowerCase().includes('meat') && 
                  !food.name.toLowerCase().includes('fish') &&
                  !food.description.toLowerCase().includes('chicken') &&
                  !food.description.toLowerCase().includes('mutton');
    const matchesVeg = !vegOnly || isVeg;

    const matchesUnder200 = !under200 || food.price <= 200;

    const rating = (food.price % 3 === 0) ? 4.5 : (food.price % 2 === 0) ? 4.2 : 3.8;
    const matchesRating = !highRated || rating >= 4.0;

    return matchesSearch && matchesCategory && matchesVeg && matchesUnder200 && matchesRating;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)', color: '#ff5a36' }}>
        <h2>Loading Cravora...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Toast popup */}
      {toast && (
        <div className={`toast ${toast.isError ? 'error' : ''}`}>
          {toast.message}
        </div>
      )}

      {/* Custom confirm modal overlay */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* Global AI Floating Chatbot */}
      {page !== 'shop-dashboard' && page !== 'delivery-rider' && <AIChatbot />}

      {/* Zomato/Swiggy-style Navigation Header */}
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setPage(user?.role === 'ADMIN' ? 'shop-dashboard' : 'home')}>
          <span>🍕</span> Cravora
        </div>

        {/* Global Search box in navbar (except for merchant dashboard) */}
        {page !== 'shop-dashboard' && page !== 'delivery-rider' && (
          <div className="search-bar" style={{ flex: 1, maxWidth: '460px', margin: '0 2rem' }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search for dishes, cuisines, or ingredients..."
              className="search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        <div className="nav-links">
          {/* Light/Dark Toggle Switcher */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.4rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.4rem',
              color: 'var(--text-primary)',
              marginRight: '0.5rem'
            }}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {page !== 'shop-dashboard' && page !== 'delivery-rider' && (
            <>
              <button className={`btn btn-secondary ${page === 'home' ? 'active' : ''}`} onClick={() => { setPage('home'); setSelectedCategory(null); }}>
                Home
              </button>
              <button className={`btn btn-secondary ${page === 'offers' ? 'active' : ''}`} onClick={() => setPage('offers')} style={{ position: 'relative' }}>
                Offers <span style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ff3860', color: 'white', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '10px', fontWeight: 800, animation: 'pulse 2s infinite' }}>NEW</span>
              </button>
              <button className={`btn btn-secondary ${page === 'cart' ? 'active' : ''}`} onClick={() => { if (user) { setPage('cart'); fetchCart(user.id); } else { setAuthMode('login'); setAuthAsMerchant(false); setShowAuthModal(true); } }}>
                🛒 Cart ({user ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0})
              </button>
              {user && (
                <>
                  <button className={`btn btn-secondary ${page === 'wallet' ? 'active' : ''}`} onClick={() => { setPage('wallet'); fetchTransactions(user.id); }}>
                    💳 Wallet (₹{user.walletBalance?.toFixed(2) || '0.00'})
                  </button>
                  <button className={`btn btn-secondary ${page === 'my-orders' || page === 'customer-support' ? 'active' : ''}`} onClick={() => { setPage('my-orders'); fetchMyOrders(user.id); }}>
                    📦 Orders &amp; Support
                  </button>
                </>
              )}
            </>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div className="nav-user-info">
                <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</div>
                  <div className={`role-badge ${user.role === 'ADMIN' ? 'admin' : 'user'}`}>
                    {user.role === 'ADMIN' ? 'Owner' : 'User'}
                  </div>
                </div>
              </div>
              <button className="btn btn-danger" onClick={handleLogout} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button className="btn btn-secondary" onClick={() => { setAuthMode('login'); setAuthAsMerchant(false); setShowAuthModal(true); }}>
                Sign In
              </button>
              <button className="btn btn-primary" onClick={() => { setAuthMode('register'); setAuthAsMerchant(false); setShowAuthModal(true); }}>
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Pages Container */}
      <main className={`main-content ${page === 'shop-dashboard' ? 'admin-main-content' : ''}`}>
        {/* HOMEPAGE / MARKETING LANDING */}
        {page === 'home' && (
          <div>
            {/* Swiggy/Zomato style Hero Header */}
            <div className="hero-banner" style={{ textAlign: 'left', padding: '4rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
              <div style={{ flex: '1 1 500px' }}>
                <span style={{ background: 'rgba(255, 82, 82, 0.1)', color: 'var(--primary-color)', fontWeight: 700, padding: '0.4rem 1rem', borderRadius: '30px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⚡ CRAVE & SAVE WEEKEND
                </span>
                <h1 style={{ fontSize: '3.4rem', marginTop: '1rem', lineHeight: '1.15' }}>
                  Deliciousness <br/>Delivered Hot &amp; Fresh
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: '1.2rem 0 2rem 0', fontSize: '1.15rem' }}>
                  Browse your local restaurant menu items. Spin rewards or apply promo codes during checkout to save big.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-primary" onClick={() => { setSelectedCategory(null); document.getElementById('menu-anchor')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    Order Online Now
                  </button>
                  <button className="btn btn-secondary" onClick={() => setPage('offers')}>
                    View active offers
                  </button>
                </div>
              </div>

              {/* Promo Banner Cards */}
              <div style={{ display: 'flex', gap: '1.5rem', flex: '1 1 350px', justifyContent: 'center' }}>
                <div className="glass-card" style={{ padding: '1.5rem', width: '200px', display: 'flex', flexDirection: 'column', gap: '0.8rem', transform: 'rotate(-3deg)' }}>
                  <span style={{ fontSize: '2.5rem' }}>🌮</span>
                  <h4 style={{ fontSize: '1.1rem' }}>Flat 50% Off</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>On all items above ₹150. Use code CRAVE50.</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', width: '200px', display: 'flex', flexDirection: 'column', gap: '0.8rem', transform: 'rotate(4deg)', borderColor: 'rgba(255, 82, 82, 0.4)' }}>
                  <span style={{ fontSize: '2.5rem' }}>🚀</span>
                  <h4 style={{ fontSize: '1.1rem' }}>Instant Delivery</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Free delivery within 30 mins to your active locations.</p>
                </div>
              </div>
            </div>

            {/* Notification Center announcements ticker */}
            {adminAnnouncements.length > 0 && (
              <div className="announcement-board-widget">
                <div className="announcement-board-header">
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>📢 Notifications &amp; System Announcements</h3>
                  <span style={{ fontSize: '0.8rem', background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    {adminAnnouncements.length} active
                  </span>
                </div>
                <div className="announcement-ticker">
                  {adminAnnouncements.slice(0, 2).map(ann => (
                    <div className="announcement-ticker-item" key={ann.id}>
                      <strong style={{ fontSize: '1.05rem', color: '#60a5fa' }}>{ann.title}</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0 0', lineHeight: '1.4' }}>
                        {ann.message}
                      </p>
                      <span className="date">{new Date(ann.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category circles scroll */}
            <div style={{ margin: '3rem 0' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>What's on your mind?</h2>
              <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                {FOOD_CATEGORIES.map(cat => (
                  <div
                    key={cat.name}
                    className={`category-circle-item ${selectedCategory === cat.name ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(selectedCategory === cat.name ? null : cat.name);
                      document.getElementById('menu-anchor')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <div
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        marginBottom: '0.8rem',
                        border: selectedCategory === cat.name ? '3px solid var(--primary-color)' : '2px solid transparent',
                        boxShadow: selectedCategory === cat.name ? '0 0 15px var(--primary-glow)' : 'none',
                        transition: '0.2s'
                      }}
                    >
                      <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: selectedCategory === cat.name ? 'var(--primary-color)' : 'var(--text-primary)' }}>
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Anchored Food Menu Grid */}
            <div id="menu-anchor" style={{ paddingTop: '1rem' }}>
              <div className="dashboard-header">
                <h2>Browse Gourmet Foods</h2>
                
                {/* Search filters row */}
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                  <button className={`btn ${vegOnly ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setVegOnly(!vegOnly)} style={{ borderRadius: '20px', padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                    {vegOnly ? '🟢 Veg Only' : '🟢 Filter Veg'}
                  </button>
                  <button className={`btn ${under200 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setUnder200(!under200)} style={{ borderRadius: '20px', padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                    {under200 ? '₹ Under 200' : '₹ Under 200'}
                  </button>
                  <button className={`btn ${highRated ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setHighRated(!highRated)} style={{ borderRadius: '20px', padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                    {highRated ? '⭐ Rating 4.0+' : '⭐ Rating 4.0+'}
                  </button>
                  {selectedCategory && (
                    <button className="btn btn-danger" onClick={() => setSelectedCategory(null)} style={{ borderRadius: '20px', padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                      Clear Category ({selectedCategory}) &times;
                    </button>
                  )}
                </div>
              </div>

              {filteredFoods.length === 0 ? (
                <div className="glass-card empty-state">
                  <h3>No matching dishes found</h3>
                  <p>Try resetting filters or search query to explore other options.</p>
                </div>
              ) : (
                <div className="food-grid">
                  {filteredFoods.map(food => {
                    const rating = (food.price % 3 === 0) ? '4.5' : (food.price % 2 === 0) ? '4.2' : '3.8';
                    const reviews = (food.price % 3 === 0) ? '120+' : '45+';
                    const showReviews = activeReviewsFoodId === food.id;

                    return (
                      <div className="glass-card food-card" key={food.id} style={{ height: 'auto' }}>
                        <div className="food-image-container">
                          <img src={getImageUrl(food.imageUrl)} alt={food.name} className="food-image" />
                          <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'var(--primary-gradient)', color: 'white', fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                            🏷️ 50% OFF up to ₹100
                          </span>
                        </div>
                        <div className="food-info">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <h3 className="food-name" style={{ margin: 0 }}>{food.name}</h3>
                            <span style={{ background: '#22c55e', color: 'white', fontSize: '0.75rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              ★ {rating}
                            </span>
                          </div>
                          <p className="food-desc">{food.description}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            <span>🚴 Free Delivery</span>
                            <span
                              style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--primary-color)', fontWeight: 600 }}
                              onClick={() => setActiveReviewsFoodId(showReviews ? null : food.id!)}
                            >
                              {showReviews ? 'Hide Reviews' : `Read Reviews (${reviews})`}
                            </span>
                          </div>
                          <div className="food-footer">
                            <span className="food-price">₹{food.price}</span>
                            <button className="btn btn-primary" onClick={() => handleAddToCart(food.id!)}>
                              Add to Cart
                            </button>
                          </div>

                          {/* Inline ratings & reviews component */}
                          {showReviews && (
                            <ReviewsSection foodId={food.id!} currentUser={user} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DYNAMIC OFFERS TAB PAGE */}
        {page === 'offers' && (
          <div>
            <div className="hero-banner" style={{ textAlign: 'left', padding: '3rem', marginBottom: '2.5rem' }}>
              <h1>Special Promo &amp; Discount Offers</h1>
              <p>Apply these codes during checkout to save big on your cravings!</p>
            </div>

            {offers.length === 0 ? (
              <div className="glass-card empty-state">
                <h3>No Active Offers Today 🎟️</h3>
                <p>Check back later for exciting restaurant discount vouchers.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {offers.map(offer => {
                  const isPopular = offer.tag?.toUpperCase() === 'MOST POPULAR';
                  const isDeals = offer.tag?.toUpperCase() === 'SUPER DEALS';
                  const borderColor = isPopular ? 'var(--primary-color)' : isDeals ? '#10b981' : '#3b82f6';
                  const tagBg = isPopular ? 'rgba(255, 82, 82, 0.1)' : isDeals ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)';
                  const tagColor = isPopular ? 'var(--primary-color)' : isDeals ? '#10b981' : '#3b82f6';

                  return (
                    <div className="glass-card" key={offer.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: `4px solid ${borderColor}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ background: tagBg, color: tagColor, fontSize: '0.75rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            {offer.tag || 'PROMO'}
                          </span>
                          <h3 style={{ fontSize: '1.4rem', marginTop: '0.5rem' }}>{offer.title}</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{offer.description}</p>
                        </div>
                        <span style={{ fontSize: '2rem' }}>{offer.icon || '🎟️'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px dashed var(--border-light)' }}>
                        <code style={{ fontWeight: 800, color: tagColor, fontSize: '1.1rem' }}>{offer.code}</code>
                        <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => applyPromoCode(offer.code, offer.discount)}>
                          Apply
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CUSTOMER CART VIEW */}
        {page === 'cart' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Your Cart</h2>
            {cart.length === 0 ? (
              <div className="glass-card empty-state">
                <h3>Your cart is empty 🛒</h3>
                <p style={{ marginBottom: '1.5rem' }}>Add items from the menu to satisfy your cravings.</p>
                <button className="btn btn-primary" onClick={() => setPage('home')}>
                  View Food Menu
                </button>
              </div>
            ) : (
              <div className="cart-container">
                <div className="cart-items-list">
                  {cart.map(item => (
                    <div className="cart-item" key={item.id}>
                      <img
                        src={getImageUrl(item.food?.imageUrl)}
                        alt={item.food?.name || 'Food item'}
                        className="cart-item-img"
                      />
                      <div className="cart-item-details">
                        <h4 className="cart-item-title">{item.food?.name || 'Deleted Food Item'}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                          {item.food?.description || 'No longer available.'}
                        </p>
                        <div className="cart-item-price">
                          ₹{item.food?.price || 0} x {item.quantity}
                        </div>
                      </div>
                      <div className="cart-item-actions">
                        <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleRemoveFromCart(item.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Rewards Gamification Spin Wheel */}
                  <GamificationWheel onApplyDiscount={applyPromoCode} />

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => setPage('home')}>
                      ← Keep Shopping
                    </button>
                    <button className="btn btn-danger" onClick={handleClearCart}>
                      Clear Cart
                    </button>
                  </div>

                  {/* CHECKOUT OPTIONS PANEL */}
                  <div className="glass-card" style={{ marginTop: '2rem' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '1.2rem' }}>⚙️ Choose Ordering Mode</h3>
                    <div className="checkout-selection-grid">
                      <div className={`checkout-select-card ${checkoutMode === 'INSTANT' ? 'selected' : ''}`} onClick={() => setCheckoutMode('INSTANT')}>
                        <span className="icon">⚡</span>
                        <span>Instant Order</span>
                      </div>
                      <div className={`checkout-select-card ${checkoutMode === 'SCHEDULED' ? 'selected' : ''}`} onClick={() => setCheckoutMode('SCHEDULED')}>
                        <span className="icon">📅</span>
                        <span>Schedule Order</span>
                      </div>
                      <div className={`checkout-select-card ${checkoutMode === 'GROUP' ? 'selected' : ''}`} onClick={() => setCheckoutMode('GROUP')}>
                        <span className="icon">👥</span>
                        <span>Group Order</span>
                      </div>
                      <div className={`checkout-select-card ${checkoutMode === 'BULK' ? 'selected' : ''}`} onClick={() => setCheckoutMode('BULK')}>
                        <span className="icon">📦</span>
                        <span>Bulk Order</span>
                      </div>
                      <div className={`checkout-select-card ${checkoutMode === 'CORPORATE' ? 'selected' : ''}`} onClick={() => setCheckoutMode('CORPORATE')}>
                        <span className="icon">🏢</span>
                        <span>Corporate Order</span>
                      </div>
                    </div>

                    {/* Mode specific inputs */}
                    {checkoutMode === 'SCHEDULED' && (
                      <div className="form-group">
                        <label>Select Scheduled Delivery Time</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={scheduledTime}
                          onChange={e => setScheduledTime(e.target.value)}
                        />
                      </div>
                    )}

                    {checkoutMode === 'GROUP' && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>Group Order ID</label>
                          <input
                            type="text"
                            placeholder="e.g. GROUP-XYZ"
                            className="form-control"
                            value={groupOrderId}
                            onChange={e => setGroupOrderId(e.target.value)}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.4rem' }}>
                          <button type="button" className="btn btn-secondary" style={{ width: '100%', padding: '0.7rem' }} onClick={() => setGroupOrderId('GROUP-' + Math.floor(Math.random() * 90000 + 10000))}>
                            🔗 Generate Code
                          </button>
                        </div>
                      </div>
                    )}

                    {checkoutMode === 'BULK' && (
                      <div style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                        🎉 Bulk Order Selected! You get a flat 15% discount on the grand total.
                      </div>
                    )}

                    {checkoutMode === 'CORPORATE' && (
                      <div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Corporate Name / Company</label>
                            <input
                              type="text"
                              placeholder="e.g. Google India"
                              className="form-control"
                              value={corporateName}
                              onChange={e => setCorporateName(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Employee ID / GSTIN</label>
                            <input type="text" placeholder="e.g. EMP-998822" className="form-control" />
                          </div>
                        </div>
                        <div style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                          🎉 Corporate Order Selected! A 10% discount is applied to your order.
                        </div>
                      </div>
                    )}

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>Additional Delivery Notes / Cooking Instructions</label>
                      <textarea
                        className="form-control"
                        placeholder="e.g. Make it extra spicy, please don't ring the bell, etc."
                        style={{ height: '70px', resize: 'vertical' }}
                        value={checkoutNotes}
                        onChange={e => setCheckoutNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Summary Side Card */}
                <div className="glass-card cart-summary">
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Order Summary</h3>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{getSubtotal()}</span>
                  </div>
                  {appliedPromo && (
                    <div className="summary-row" style={{ color: '#10b981' }}>
                      <span>Promo Discount ({appliedPromo.code})</span>
                      <span>- ₹{getDiscountAmount()}</span>
                    </div>
                  )}
                  {checkoutMode === 'BULK' && (
                    <div className="summary-row" style={{ color: '#10b981' }}>
                      <span>Bulk Discount (15%)</span>
                      <span>- ₹{Math.round(getGrandTotal() * 0.15)}</span>
                    </div>
                  )}
                  {checkoutMode === 'CORPORATE' && (
                    <div className="summary-row" style={{ color: '#10b981' }}>
                      <span>Corporate Discount (10%)</span>
                      <span>- ₹{Math.round(getGrandTotal() * 0.10)}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Delivery Fee</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>FREE</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount</span>
                    <span>₹{getCheckoutTotal()}</span>
                  </div>
                  
                  {/* Applied promo display */}
                  {appliedPromo ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: '#10b981', marginBottom: '1rem' }}>
                      <span>Code <strong>{appliedPromo.code}</strong> applied!</span>
                      <span style={{ cursor: 'pointer', fontWeight: 700 }} onClick={() => setAppliedPromo(null)}>Remove</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.2rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setPage('offers')}>
                      🏷️ Have a promo code? View Offers
                    </div>
                  )}

                  {/* PAYMENT METHOD SECTION */}
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Payment Method</h4>
                    
                    <div className="checkout-selection-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                      <div className={`checkout-select-card ${paymentMethod === 'UPI' ? 'selected' : ''}`} onClick={() => { setPaymentMethod('UPI'); setWalletAmountPaid(0); setOtherAmountPaid(getCheckoutTotal()); }}>
                        <span>📱</span>
                        <span style={{ fontSize: '0.75rem' }}>UPI</span>
                      </div>
                      <div className={`checkout-select-card ${paymentMethod === 'CARD' ? 'selected' : ''}`} onClick={() => { setPaymentMethod('CARD'); setWalletAmountPaid(0); setOtherAmountPaid(getCheckoutTotal()); }}>
                        <span>💳</span>
                        <span style={{ fontSize: '0.75rem' }}>Card</span>
                      </div>
                      <div className={`checkout-select-card ${paymentMethod === 'NET_BANKING' ? 'selected' : ''}`} onClick={() => { setPaymentMethod('NET_BANKING'); setWalletAmountPaid(0); setOtherAmountPaid(getCheckoutTotal()); }}>
                        <span>🏢</span>
                        <span style={{ fontSize: '0.75rem' }}>Net Bank</span>
                      </div>
                      <div className={`checkout-select-card ${paymentMethod === 'WALLET' ? 'selected' : ''}`} onClick={() => { setPaymentMethod('WALLET'); setWalletAmountPaid(getCheckoutTotal()); setOtherAmountPaid(0); }}>
                        <span>💰</span>
                        <span style={{ fontSize: '0.75rem' }}>Wallet</span>
                      </div>
                      <div className={`checkout-select-card ${paymentMethod === 'SPLIT' ? 'selected' : ''}`} onClick={() => { 
                        setPaymentMethod('SPLIT');
                        const maxWallet = Math.min(user?.walletBalance || 0, getCheckoutTotal());
                        setWalletAmountPaid(maxWallet);
                        setOtherAmountPaid(getCheckoutTotal() - maxWallet);
                      }}>
                        <span>🔀</span>
                        <span style={{ fontSize: '0.75rem' }}>Split</span>
                      </div>
                      <div className={`checkout-select-card ${paymentMethod === 'COD' ? 'selected' : ''}`} onClick={() => { setPaymentMethod('COD'); setWalletAmountPaid(0); setOtherAmountPaid(getCheckoutTotal()); }}>
                        <span>💵</span>
                        <span style={{ fontSize: '0.75rem' }}>COD</span>
                      </div>
                    </div>

                    {/* Payment details form fields */}
                    {paymentMethod === 'UPI' && (
                      <div className="form-group">
                        <label>UPI ID</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. user@okhdfcbank"
                          required
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                        />
                      </div>
                    )}

                    {paymentMethod === 'CARD' && (
                      <div>
                        <div className="form-group">
                          <label>Card Number</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="xxxx xxxx xxxx xxxx"
                            required
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value)}
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Expiry</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/YY"
                              required
                              value={cardExpiry}
                              onChange={e => setCardExpiry(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>CVV</label>
                            <input
                              type="password"
                              className="form-control"
                              placeholder="***"
                              required
                              value={cardCvv}
                              onChange={e => setCardCvv(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'NET_BANKING' && (
                      <div className="form-group">
                        <label>Select Bank</label>
                        <select
                          className="form-control"
                          value={selectedBank}
                          onChange={e => setSelectedBank(e.target.value)}
                        >
                          <option value="SBI">State Bank of India (SBI)</option>
                          <option value="HDFC">HDFC Bank</option>
                          <option value="ICICI">ICICI Bank</option>
                          <option value="AXIS">Axis Bank</option>
                        </select>
                      </div>
                    )}

                    {paymentMethod === 'WALLET' && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                        Deducting <strong>₹{getCheckoutTotal()}</strong> from wallet (Current: <strong>₹{user?.walletBalance?.toFixed(2) || '0.00'}</strong>)
                      </div>
                    )}

                    {paymentMethod === 'SPLIT' && (
                      <div className="split-slider-container">
                        <div className="split-amounts-row">
                          <span>Wallet: <strong style={{ color: '#10b981' }}>₹{walletAmountPaid}</strong></span>
                          <span>UPI/Card: <strong style={{ color: '#ff5252' }}>₹{otherAmountPaid}</strong></span>
                        </div>
                        <input
                          type="range"
                          className="split-range-input"
                          min="0"
                          max={Math.min(user?.walletBalance || 0, getCheckoutTotal())}
                          step="1"
                          value={walletAmountPaid}
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            setWalletAmountPaid(val);
                            setOtherAmountPaid(getCheckoutTotal() - val);
                          }}
                        />
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                          Drag slider to choose wallet contribution
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'COD' && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Pay cash when food arrives at your address.
                      </div>
                    )}
                  </div>

                  {/* Simulate payment failure toggle */}
                  {paymentMethod !== 'COD' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                      <input
                        type="checkbox"
                        id="simulate-fail"
                        checked={simulateFailure}
                        onChange={e => setSimulateFailure(e.target.checked)}
                      />
                      <label htmlFor="simulate-fail" style={{ color: '#fca5a5', cursor: 'pointer', fontWeight: 600 }}>
                        Simulate Payment Failure (Retry testing)
                      </label>
                    </div>
                  )}

                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={handlePlaceOrder}>
                    Confirm Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMER WALLET & PAYMENT HISTORY VIEW */}
        {page === 'wallet' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>💳 Your Digital Wallet</h2>
            <div className="wallet-grid">
              <div className="glass-card wallet-balance-card">
                <h3>Wallet Balance</h3>
                <div className="wallet-amount-large">₹{user?.walletBalance?.toFixed(2) || '0.00'}</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Use your wallet balance for instantaneous, secure checkouts and split payments.
                </p>
                <form onSubmit={handleAddWalletFunds} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0, textAlign: 'left' }}>
                    <label>Add Funds to Wallet</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter amount (e.g. ₹500)"
                      value={walletAmountToAdd}
                      onChange={e => setWalletAmountToAdd(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Add Balance
                  </button>
                </form>
              </div>

              <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem' }}>Transaction &amp; Payment History</h3>
                {transactions.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                    No wallet or payment transactions recorded yet.
                  </div>
                ) : (
                  <div className="transaction-list">
                    {transactions.map(tx => {
                      const isCredit = tx.type === 'WALLET_ADD' || tx.type === 'REFUND';
                      return (
                        <div className="transaction-item" key={tx.id}>
                          <div className="tx-details">
                            <span className="tx-title">
                              {tx.type === 'WALLET_ADD' ? '💰 Wallet Topped Up' : tx.type === 'REFUND' ? '🔄 Refund Credited' : '🍔 Food Payment'}
                            </span>
                            <span className="tx-date">
                              {new Date(tx.timestamp).toLocaleString()} | Method: {tx.paymentMethod}
                            </span>
                            {tx.orderId && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Order ID: #{tx.orderId}</span>}
                          </div>
                          <div className={`tx-amount ${isCredit ? 'credit' : 'debit'}`}>
                            {isCredit ? '+' : '-'} ₹{tx.amount.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMER MY ORDERS & SUPPORT PORTAL */}
        {page === 'my-orders' && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
              <button className="btn btn-secondary active" onClick={() => setPage('my-orders')}>📦 Your Orders</button>
              <button className="btn btn-secondary" onClick={() => setPage('customer-support')}>✉️ Customer Support Portal</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '2rem', margin: 0 }}>Your Orders Queue</h2>
              <button className="btn btn-primary" onClick={handleRepeatLastOrder}>
                🔄 Repeat Last Order
              </button>
            </div>

            {myOrders.length === 0 ? (
              <div className="glass-card empty-state">
                <h3>No orders placed yet 📦</h3>
                <p style={{ marginBottom: '1.5rem' }}>Place your first order and track it in real-time.</p>
                <button className="btn btn-primary" onClick={() => setPage('home')}>
                  Browse Menu
                </button>
              </div>
            ) : (
              <div>
                {myOrders.map(order => {
                  const statusSteps = ['PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                  const currentIndex = statusSteps.indexOf(order.status.toUpperCase());
                  const isPaymentFailed = order.status.toUpperCase() === 'PAYMENT_FAILED' || order.paymentStatus?.toUpperCase() === 'FAILED';

                  return (
                    <div className="glass-card order-card" key={order.id} style={{ position: 'relative' }}>
                      <div className="order-card-header">
                        <div>
                          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>Order #{order.id}</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Amount Charged: <span style={{ color: '#10b981', fontWeight: 700 }}>₹{order.totalAmount}</span>
                          </p>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                              Mode: <strong>{order.orderType || 'INSTANT'}</strong>
                            </span>
                            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                              Payment: <strong>{order.paymentMethod || 'UPI'}</strong>
                            </span>
                            <span style={{ fontSize: '0.75rem', background: isPaymentFailed ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px', color: isPaymentFailed ? '#ef4444' : '#10b981', border: '1px solid currentColor' }}>
                              Status: <strong>{order.paymentStatus || 'COMPLETED'}</strong>
                            </span>
                            {order.groupOrderId && (
                              <span style={{ fontSize: '0.75rem', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: '4px', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                                Group ID: <strong>{order.groupOrderId}</strong>
                              </span>
                            )}
                            {order.scheduledTime && (
                              <span style={{ fontSize: '0.75rem', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '4px', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
                                Scheduled: <strong>{order.scheduledTime}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Items details */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Items ordered</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '0.9rem' }}>
                              <span style={{ fontWeight: 600 }}>{item.foodName}</span> x {item.quantity} (₹{item.price * item.quantity})
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stepper Status tracker */}
                      {!isPaymentFailed && (
                        <div className="stepper">
                          <div className={`step ${currentIndex >= 0 ? 'completed' : ''} ${currentIndex === 0 ? 'active' : ''}`}>
                            <div className="step-icon">1</div>
                            <div className="step-label">Pending</div>
                          </div>
                          <div className={`step ${currentIndex >= 1 ? 'completed' : ''} ${currentIndex === 1 ? 'active' : ''}`}>
                            <div className="step-icon">2</div>
                            <div className="step-label">Preparing</div>
                          </div>
                          <div className={`step ${currentIndex >= 2 ? 'completed' : ''} ${currentIndex === 2 ? 'active' : ''}`}>
                            <div className="step-icon">3</div>
                            <div className="step-label">Out for Delivery</div>
                          </div>
                          <div className={`step ${currentIndex >= 3 ? 'completed' : ''} ${currentIndex === 3 ? 'active' : ''}`}>
                            <div className="step-icon">4</div>
                            <div className="step-label">Delivered</div>
                          </div>
                        </div>
                      )}

                      {/* Payment failed alert and retry */}
                      {isPaymentFailed && (
                        <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', padding: '1rem', borderRadius: '8px', marginTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                          <div>
                            <strong style={{ color: '#ef4444' }}>⚠️ Payment Failed!</strong>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Your payment could not be processed. Please retry to start order preparation.</div>
                          </div>
                          <button className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }} onClick={() => setRetryOrder(order)}>
                            Retry Payment 💳
                          </button>
                        </div>
                      )}

                      {/* Reorder and cancel buttons */}
                      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => handleReorderItems(order.items)}>
                          🛒 Reorder items
                        </button>
                        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
                          <button className="btn btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}>
                            Cancel Order
                          </button>
                        )}
                      </div>

                      {/* Order Live Tracker simulation */}
                      {order.status === 'OUT_FOR_DELIVERY' && (
                        <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', padding: '1rem', borderRadius: '8px', marginTop: '1.2rem', textAlign: 'center' }}>
                          <span style={{ fontSize: '1.4rem' }}>🚴</span> <strong style={{ color: '#3b82f6' }}>Rider has picked up your order and is moving towards your location!</strong>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>ETA: Under 12 minutes</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* GROUP ORDER TRACKER DASHBOARD */}
            <div className="glass-card" style={{ marginTop: '3rem' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>👥 Group Order Tracker</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Enter a Group Order ID to view and track all active orders placed by members of your group.
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', maxWidth: '500px' }}>
                <input
                  type="text"
                  placeholder="Enter Group Order ID (e.g. GROUP-123)"
                  className="form-control"
                  style={{ flex: 1 }}
                  value={trackedGroupId}
                  onChange={e => setTrackedGroupId(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleTrackGroupOrder}>
                  Track Group
                </button>
              </div>

              {groupOrders.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Orders in Group "{trackedGroupId}"</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {groupOrders.map(go => (
                      <div key={go.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                        <div>
                          <strong>Order #{go.id}</strong> (User #{go.userId})
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                            Items: {go.items.map(i => `${i.foodName} x${i.quantity}`).join(', ')}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: '#10b981' }}>₹{go.totalAmount}</div>
                          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 600 }}>{go.status}</span>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', fontWeight: 700 }}>
                      <span>Group Total Cost</span>
                      <span style={{ color: '#10b981' }}>₹{groupOrders.reduce((sum, o) => sum + o.totalAmount, 0)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RETRY PAYMENT MODAL */}
            {retryOrder && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: '450px' }}>
                  <div className="modal-header">
                    <h3 style={{ margin: 0 }}>Retry Payment for Order #{retryOrder.id}</h3>
                    <button className="modal-close" onClick={() => setRetryOrder(null)}>&times;</button>
                  </div>
                  <form onSubmit={handleRetryPaymentSubmit}>
                    <div style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                        <span>Order Total Amount:</span>
                        <strong style={{ color: '#10b981' }}>₹{retryOrder.totalAmount}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span>Your Wallet Balance:</span>
                        <span>₹{user?.walletBalance?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Select Payment Method</label>
                      <select
                        className="form-control"
                        value={retryPaymentMethod}
                        onChange={e => setRetryPaymentMethod(e.target.value)}
                      >
                        <option value="UPI">UPI</option>
                        <option value="CARD">Credit/Debit Card</option>
                        <option value="NET_BANKING">Net Banking</option>
                        <option value="WALLET">Wallet (₹{user?.walletBalance?.toFixed(2) || '0.00'})</option>
                        <option value="SPLIT">Split (Wallet + Card/UPI)</option>
                      </select>
                    </div>

                    {retryPaymentMethod === 'UPI' && (
                      <div className="form-group">
                        <label>UPI ID</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. user@okhdfcbank"
                          required
                          value={retryUpiId}
                          onChange={e => setRetryUpiId(e.target.value)}
                        />
                      </div>
                    )}

                    {retryPaymentMethod === 'CARD' && (
                      <div>
                        <div className="form-group">
                          <label>Card Number</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="xxxx xxxx xxxx xxxx"
                            required
                            value={retryCardNumber}
                            onChange={e => setRetryCardNumber(e.target.value)}
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Expiry Date</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="MM/YY"
                              required
                              value={retryCardExpiry}
                              onChange={e => setRetryCardExpiry(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>CVV</label>
                            <input
                              type="password"
                              className="form-control"
                              placeholder="***"
                              required
                              value={retryCardCvv}
                              onChange={e => setRetryCardCvv(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {retryPaymentMethod === 'NET_BANKING' && (
                      <div className="form-group">
                        <label>Select Bank</label>
                        <select
                          className="form-control"
                          value={retrySelectedBank}
                          onChange={e => setRetrySelectedBank(e.target.value)}
                        >
                          <option value="SBI">State Bank of India (SBI)</option>
                          <option value="HDFC">HDFC Bank</option>
                          <option value="ICICI">ICICI Bank</option>
                          <option value="AXIS">Axis Bank</option>
                        </select>
                      </div>
                    )}

                    {retryPaymentMethod === 'SPLIT' && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: '6px' }}>
                        ℹ️ Split payment will automatically deduct all available wallet balance (<strong>₹{Math.min(user?.walletBalance || 0, retryOrder.totalAmount)}</strong>) and charge the rest (<strong>₹{Math.max(0, retryOrder.totalAmount - (user?.walletBalance || 0))}</strong>) via simulated UPI.
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                      <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setRetryOrder(null)}>Cancel</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Complete Payment</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMER SUPPORT PORTAL TAB */}
        {page === 'customer-support' && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
              <button className="btn btn-secondary" onClick={() => setPage('my-orders')}>📦 Your Orders</button>
              <button className="btn btn-secondary active" onClick={() => setPage('customer-support')}>✉️ Customer Support Portal</button>
            </div>
            <SupportPortal currentUser={user} onShowToast={showToast} />
          </div>
        )}

        {/* DELIVERY RIDER APP VIEW */}
        {page === 'delivery-rider' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>🚴 Delivery Partner Portal</h2>
            <DeliveryPortal onShowToast={showToast} />
          </div>
        )}

        {/* SHOP OWNER DASHBOARD */}
        {page === 'shop-dashboard' && (
          <div className="admin-layout">
            {/* Sidebar menu */}
            <div className="admin-sidebar">
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>🛡️ Admin Panel</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>System Control Center</span>
                </div>
                <div className="admin-sidebar-menu">
                  <div className={`admin-sidebar-item ${adminTab === 'dashboard' ? 'active' : ''}`} onClick={() => setAdminTab('dashboard')}>📊 Dashboard</div>
                  <div className={`admin-sidebar-item ${adminTab === 'users' ? 'active' : ''}`} onClick={() => setAdminTab('users')}>👥 Users</div>
                  <div className={`admin-sidebar-item ${adminTab === 'restaurants' ? 'active' : ''}`} onClick={() => setAdminTab('restaurants')}>🏢 Restaurants</div>
                  <div className={`admin-sidebar-item ${adminTab === 'riders' ? 'active' : ''}`} onClick={() => setAdminTab('riders')}>🚴 Riders</div>
                  <div className={`admin-sidebar-item ${adminTab === 'foods' ? 'active' : ''}`} onClick={() => setAdminTab('foods')}>🍔 Menu Items</div>
                  <div className={`admin-sidebar-item ${adminTab === 'orders' ? 'active' : ''}`} onClick={() => setAdminTab('orders')}>📋 Orders Queue</div>
                  <div className={`admin-sidebar-item ${adminTab === 'categories' ? 'active' : ''}`} onClick={() => setAdminTab('categories')}>🏷️ Categories</div>
                  <div className={`admin-sidebar-item ${adminTab === 'offers' ? 'active' : ''}`} onClick={() => setAdminTab('offers')}>🎟️ Promo Coupons</div>
                  <div className={`admin-sidebar-item ${adminTab === 'reports' ? 'active' : ''}`} onClick={() => setAdminTab('reports')}>📈 Reports</div>
                  <div className={`admin-sidebar-item ${adminTab === 'analytics' ? 'active' : ''}`} onClick={() => setAdminTab('analytics')}>📊 Advanced Analytics</div>
                  <div className={`admin-sidebar-item ${adminTab === 'payments' ? 'active' : ''}`} onClick={() => setAdminTab('payments')}>💸 Payments Ledger</div>
                  <div className={`admin-sidebar-item ${adminTab === 'refunds' ? 'active' : ''}`} onClick={() => setAdminTab('refunds')}>🔄 Refund Approvals</div>
                  <div className={`admin-sidebar-item ${adminTab === 'commission' ? 'active' : ''}`} onClick={() => setAdminTab('commission')}>🪙 Commission Setup</div>
                  <div className={`admin-sidebar-item ${adminTab === 'cities' ? 'active' : ''}`} onClick={() => setAdminTab('cities')}>📍 Operating Cities</div>
                  <div className={`admin-sidebar-item ${adminTab === 'announcements' ? 'active' : ''}`} onClick={() => setAdminTab('announcements')}>📢 Notification Center</div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="admin-main-pane">
              {/* Tab 1: Dashboard */}
              {adminTab === 'dashboard' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Overview Dashboard</h2>
                  <div className="admin-stats-grid">
                    <div className="stats-card">
                      <div className="stats-info">
                        <span className="stats-label">Total Platform Revenue</span>
                        <span className="stats-value">₹{adminCommissionMetrics.totalDeliveredRevenue || 0}</span>
                      </div>
                      <div className="stats-icon text-success">💰</div>
                    </div>
                    <div className="stats-card">
                      <div className="stats-info">
                        <span className="stats-label">Commission Earned ({adminCommissionMetrics.globalCommissionRate || 15}%)</span>
                        <span className="stats-value">₹{adminCommissionMetrics.totalCommissionEarned?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="stats-icon text-warning">🪙</div>
                    </div>
                    <div className="stats-card">
                      <div className="stats-info">
                        <span className="stats-label">Active Orders</span>
                        <span className="stats-value">{activeOrdersCount}</span>
                      </div>
                      <div className="stats-icon text-info">⏳</div>
                    </div>
                    <div className="stats-card">
                      <div className="stats-info">
                        <span className="stats-label">Active Restaurants</span>
                        <span className="stats-value">{adminRestaurants.length}</span>
                      </div>
                      <div className="stats-icon text-danger">🏢</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                    <div className="glass-card">
                      <h3>🚴 Dispatch Rider Status</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                        {adminRiders.map(r => (
                          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem', borderBottom: '1px solid var(--border-light)' }}>
                            <span>{r.name} ({r.vehicleType})</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: r.status === 'AVAILABLE' ? '#10b981' : r.status === 'DELIVERING' ? '#3b82f6' : '#9ca3af' }}>
                              {r.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="glass-card">
                      <h3>📍 Operating Hub Cities</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                        {adminCities.map(c => (
                          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem', borderBottom: '1px solid var(--border-light)' }}>
                            <span>{c.name}, {c.state}</span>
                            <span style={{ fontSize: '0.8rem', color: c.activeStatus ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                              {c.activeStatus ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: User Management */}
              {adminTab === 'users' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>User Directory &amp; Role Management</h2>
                  <div className="item-table-container">
                    <table className="item-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role Modifier</th>
                          <th>Wallet Balance</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers.map(u => (
                          <tr key={u.id}>
                            <td>#{u.id}</td>
                            <td style={{ fontWeight: 600 }}>{u.name}</td>
                            <td>{u.email}</td>
                            <td>
                              <select
                                className="select-control"
                                value={u.role}
                                onChange={e => handleUpdateUserRole(u.id, e.target.value)}
                              >
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="RIDER">RIDER</option>
                              </select>
                            </td>
                            <td style={{ fontWeight: 700, color: '#10b981' }}>₹{u.walletBalance?.toFixed(2) || '0.00'}</td>
                            <td>
                              <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => {
                                if(confirm(`Are you sure you want to delete user ${u.name}?`)) handleDeleteUser(u.id);
                              }}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Restaurant Management */}
              {adminTab === 'restaurants' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.6rem', margin: 0 }}>Restaurant Network Directory</h2>
                    <button className="btn btn-primary" onClick={() => setShowRestaurantModal(true)}>+ Add Restaurant</button>
                  </div>
                  <div className="item-table-container">
                    <table className="item-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Cuisine</th>
                          <th>Address</th>
                          <th>Platform Commission</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminRestaurants.map(r => (
                          <tr key={r.id}>
                            <td>#{r.id}</td>
                            <td style={{ fontWeight: 600 }}>{r.name}</td>
                            <td>{r.cuisineType}</td>
                            <td>{r.address}</td>
                            <td>{(r.commissionRate * 100).toFixed(0)}%</td>
                            <td>
                              <button
                                className={`btn ${r.activeStatus ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                                onClick={() => handleToggleRestaurant(r)}
                              >
                                {r.activeStatus ? '🟢 Active' : '🔴 Inactive'}
                              </button>
                            </td>
                            <td>
                              <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleDeleteRestaurant(r.id!)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 4: Delivery Partner Management */}
              {adminTab === 'riders' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.6rem', margin: 0 }}>Delivery Rider fleet</h2>
                    <button className="btn btn-primary" onClick={() => setShowRiderModal(true)}>+ Register Rider</button>
                  </div>
                  <div className="item-table-container">
                    <table className="item-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Phone</th>
                          <th>Vehicle</th>
                          <th>Active Deliveries</th>
                          <th>Availability Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminRiders.map(rider => (
                          <tr key={rider.id}>
                            <td>#{rider.id}</td>
                            <td style={{ fontWeight: 600 }}>{rider.name}</td>
                            <td>{rider.phone}</td>
                            <td>{rider.vehicleType}</td>
                            <td>{rider.activeDeliveryCount}</td>
                            <td>
                              <button
                                className={`btn ${rider.status === 'AVAILABLE' ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                                onClick={() => handleToggleRider(rider)}
                              >
                                {rider.status}
                              </button>
                            </td>
                            <td>
                              <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleDeleteRider(rider.id!)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 5: Menu Items (Foods) */}
              {adminTab === 'foods' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.6rem', margin: 0 }}>Menu Items List</h2>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setEditingFood(null);
                        setFoodForm({ name: '', description: '', price: '', imageFile: null });
                        setShowFoodModal(true);
                      }}
                    >
                      + Add New Food
                    </button>
                  </div>

                  {foods.length === 0 ? (
                    <div className="glass-card empty-state">
                      <h3>No foods in menu</h3>
                      <p>Get started by adding your first food item using the button above.</p>
                    </div>
                  ) : (
                    <div className="item-table-container">
                      <table className="item-table">
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {foods.map(food => (
                            <tr key={food.id}>
                              <td>
                                <img
                                  src={getImageUrl(food.imageUrl)}
                                  alt={food.name}
                                  style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                                />
                              </td>
                              <td style={{ fontWeight: 600 }}>{food.name}</td>
                              <td style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>{food.description}</td>
                              <td style={{ fontWeight: 700 }}>₹{food.price}</td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => openEditModal(food)}>
                                    Edit
                                  </button>
                                  <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleDeleteFoodWithConfirm(food.id!)}>
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 6: Incoming Orders Queue */}
              {adminTab === 'orders' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '2rem' }}>Customer Orders Queue</h2>
                  {adminOrders.length === 0 ? (
                    <div className="glass-card empty-state">
                      <h3>No customer orders yet 📋</h3>
                      <p>Once users check out, their orders will appear here in real-time.</p>
                    </div>
                  ) : (
                    <div className="admin-orders-list">
                      {adminOrders.map(order => (
                        <div className={`glass-card admin-order-card ${order.status.toLowerCase()}`} key={order.id}>
                          <div className="admin-order-header">
                            <div>
                              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>Order #{order.id}</h3>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Total Amount: <span style={{ color: '#10b981', fontWeight: 700 }}>₹{order.totalAmount}</span>
                              </p>
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '4px' }}>Type: {order.orderType || 'INSTANT'}</span>
                                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '4px' }}>Payment: {order.paymentMethod || 'UPI'} ({order.paymentStatus || 'COMPLETED'})</span>
                              </div>
                            </div>
                            
                            <div className="order-actions">
                              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
                                Update Status:
                              </span>
                              <select
                                className="select-control"
                                value={order.status}
                                onChange={e => handleUpdateStatus(order.id, e.target.value)}
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="PREPARING">PREPARING</option>
                                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                                <option value="DELIVERED">DELIVERED</option>
                              </select>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div style={{ marginTop: '1rem' }}>
                            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Items ordered</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                              {order.items.map((item, idx) => (
                                <div key={idx} style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: '0.9rem' }}>
                                  <span style={{ fontWeight: 600 }}>{item.foodName}</span> x {item.quantity}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 7: Categories */}
              {adminTab === 'categories' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.6rem', margin: 0 }}>Food Category Tags</h2>
                    <button className="btn btn-primary" onClick={() => setShowCategoryModal(true)}>+ Add Category</button>
                  </div>
                  <div className="item-table-container">
                    <table className="item-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Icon</th>
                          <th>Category Name</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminCategories.map(cat => (
                          <tr key={cat.id}>
                            <td>#{cat.id}</td>
                            <td style={{ fontSize: '1.5rem' }}>{cat.icon}</td>
                            <td style={{ fontWeight: 600 }}>{cat.name}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleDeleteCategory(cat.id!)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 8: Coupons (Promo Offers) */}
              {adminTab === 'offers' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.6rem', margin: 0 }}>Discount Coupons List</h2>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setOfferForm({ title: '', description: '', code: '', discount: '', tag: 'MOST POPULAR', icon: '🎉' });
                        setShowOfferModal(true);
                      }}
                    >
                      + Create New Promo
                    </button>
                  </div>

                  {offers.length === 0 ? (
                    <div className="glass-card empty-state">
                      <h3>No Promo Coupons Created 🎟️</h3>
                      <p>Click the button above to launch your first marketing campaign code.</p>
                    </div>
                  ) : (
                    <div className="item-table-container">
                      <table className="item-table">
                        <thead>
                          <tr>
                            <th>Icon</th>
                            <th>Promo Code</th>
                            <th>Title / Headline</th>
                            <th>Description</th>
                            <th>Discount</th>
                            <th>Category Tag</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {offers.map(offer => (
                            <tr key={offer.id}>
                              <td style={{ fontSize: '1.6rem' }}>{offer.icon}</td>
                              <td style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{offer.code}</td>
                              <td style={{ fontWeight: 600 }}>{offer.title}</td>
                              <td style={{ color: 'var(--text-secondary)' }}>{offer.description}</td>
                              <td style={{ fontWeight: 700, color: '#10b981' }}>{Math.round(offer.discount * 100)}% OFF</td>
                              <td>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                                  {offer.tag}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleDeleteOfferWithConfirm(offer.id!)}>
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 9: Performance Reports */}
              {adminTab === 'reports' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Operational Reports &amp; Analytics</h2>
                  <div className="glass-card" style={{ marginBottom: '2rem' }}>
                    <h3>Sales &amp; Earning Metrics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>AVERAGE ORDER VALUE</span>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.4rem' }}>
                          ₹{adminOrders.length > 0 ? (adminOrders.reduce((sum, o) => sum + o.totalAmount, 0) / adminOrders.length).toFixed(0) : 0}
                        </div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>COMPLETED ORDERS</span>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '0.4rem' }}>
                          {adminOrders.filter(o => o.status === 'DELIVERED').length}
                        </div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>ACTIVE CITIES</span>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.4rem' }}>
                          {adminCities.filter(c => c.activeStatus).length}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card">
                    <h3>Orders Revenue Ledger</h3>
                    <div className="item-table-container" style={{ marginTop: '1rem' }}>
                      <table className="item-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>User ID</th>
                            <th>Total Charged</th>
                            <th>Order Mode</th>
                            <th>Payment Method</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminOrders.map(o => (
                            <tr key={o.id}>
                              <td>#{o.id}</td>
                              <td>#{o.userId}</td>
                              <td style={{ fontWeight: 700 }}>₹{o.totalAmount}</td>
                              <td>{o.orderType || 'INSTANT'}</td>
                              <td>{o.paymentMethod || 'UPI'}</td>
                              <td style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600, color: o.status === 'DELIVERED' ? '#10b981' : '#fbbf24' }}>
                                {o.status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 10: Payments Ledger */}
              {adminTab === 'payments' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Platform Transactions Ledger</h2>
                  <div className="item-table-container">
                    <table className="item-table">
                      <thead>
                        <tr>
                          <th>TX ID</th>
                          <th>User ID</th>
                          <th>Amount</th>
                          <th>Type</th>
                          <th>Method</th>
                          <th>Timestamp</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminTransactions.map(tx => (
                          <tr key={tx.id}>
                            <td>#{tx.id}</td>
                            <td>#{tx.userId}</td>
                            <td style={{ fontWeight: 700, color: tx.type === 'PAYMENT' ? '#ef4444' : '#10b981' }}>
                              {tx.type === 'PAYMENT' ? '-' : '+'} ₹{tx.amount.toFixed(2)}
                            </td>
                            <td>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: tx.type === 'PAYMENT' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: tx.type === 'PAYMENT' ? '#fca5a5' : '#a7f3d0' }}>
                                {tx.type}
                              </span>
                            </td>
                            <td>{tx.paymentMethod}</td>
                            <td style={{ fontSize: '0.85rem' }}>{new Date(tx.timestamp).toLocaleString()}</td>
                            <td>
                              <span style={{ color: tx.status === 'SUCCESS' ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 11: Refund Approvals */}
              {adminTab === 'refunds' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Pending Cancellations &amp; Refund Approvals</h2>
                  {adminPendingRefunds.length === 0 ? (
                    <div className="glass-card empty-state">
                      <h3>No cancelled orders requiring refund approval 💳</h3>
                      <p>Cancelled wallet transactions are automatically resolved, but manual reviews appear here.</p>
                    </div>
                  ) : (
                    <div className="item-table-container">
                      <table className="item-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>User ID</th>
                            <th>Refund Amount</th>
                            <th>Payment Method</th>
                            <th>Order Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminPendingRefunds.map(order => (
                            <tr key={order.id}>
                              <td>#{order.id}</td>
                              <td>#{order.userId}</td>
                              <td style={{ fontWeight: 700, color: '#10b981' }}>₹{order.totalAmount}</td>
                              <td>{order.paymentMethod}</td>
                              <td>
                                <span className={`status-badge ${order.status.toLowerCase()}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td>
                                {order.status === 'CANCELLED' ? (
                                  <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleApproveRefund(order.id)}>
                                    Approve Wallet Refund
                                  </button>
                                ) : (
                                  <span style={{ color: '#10b981', fontWeight: 600 }}>Refund Credited</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 12: Commission Management */}
              {adminTab === 'commission' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Commission &amp; Platform Earnings</h2>
                  <div className="glass-card" style={{ marginBottom: '2rem', maxWidth: '500px' }}>
                    <h3>Global Commission Configuration</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                      Configure the default percentage share of order totals retained by the platform from partner restaurants.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Global share % (e.g. 15)"
                        defaultValue={adminCommissionMetrics.globalCommissionRate}
                        id="global-comm-input"
                      />
                      <button className="btn btn-primary" onClick={() => {
                        const input = document.getElementById('global-comm-input') as HTMLInputElement;
                        if(input) handleUpdateGlobalCommission(parseFloat(input.value));
                      }}>
                        Update Rate
                      </button>
                    </div>
                  </div>

                  <div className="glass-card">
                    <h3>Commission Metrics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TOTAL COMMISSION REVENUE</span>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.5rem' }}>
                          ₹{adminCommissionMetrics.totalCommissionEarned?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TOTAL DELIVERED PARTNER SALES</span>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                          ₹{adminCommissionMetrics.totalDeliveredRevenue || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 13: Operating Cities */}
              {adminTab === 'cities' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.6rem', margin: 0 }}>Operational Cities Whitelist</h2>
                    <button className="btn btn-primary" onClick={() => setShowCityModal(true)}>+ Add City</button>
                  </div>
                  <div className="item-table-container">
                    <table className="item-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>City Name</th>
                          <th>State / Region</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminCities.map(city => (
                          <tr key={city.id}>
                            <td>#{city.id}</td>
                            <td style={{ fontWeight: 600 }}>{city.name}</td>
                            <td>{city.state}</td>
                            <td>
                              <button
                                className={`btn ${city.activeStatus ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                                onClick={() => handleToggleCity(city)}
                              >
                                {city.activeStatus ? 'Active Delivery' : 'Suspended'}
                              </button>
                            </td>
                            <td>
                              <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleDeleteCity(city.id!)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 14: Notification Center (Announcements) */}
              {adminTab === 'announcements' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.6rem', margin: 0 }}>Global Announcements &amp; Notifications</h2>
                    <button className="btn btn-primary" onClick={() => setShowAnnouncementModal(true)}>📢 Broadcast Announcement</button>
                  </div>
                  <div className="item-table-container">
                    <table className="item-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Message Body</th>
                          <th>Date Broadcasted</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminAnnouncements.map(ann => (
                          <tr key={ann.id}>
                            <td>#{ann.id}</td>
                            <td style={{ fontWeight: 600 }}>{ann.title}</td>
                            <td style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>{ann.message}</td>
                            <td>{new Date(ann.timestamp).toLocaleString()}</td>
                            <td>
                              <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleDeleteAnnouncement(ann.id!)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 15: Advanced Analytics */}
              {adminTab === 'analytics' && (
                <AnalyticsDashboard />
              )}
            </div>

            {/* --- ADD RESTAURANT MODAL --- */}
            {showRestaurantModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>Register Operational Restaurant</h3>
                    <button className="modal-close" onClick={() => setShowRestaurantModal(false)}>&times;</button>
                  </div>
                  <form onSubmit={handleCreateRestaurant}>
                    <div className="form-group">
                      <label>Restaurant Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={restaurantForm.name}
                        onChange={e => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Cuisine Category</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. North Indian, Fast Food, Chinese"
                        required
                        value={restaurantForm.cuisineType}
                        onChange={e => setRestaurantForm({ ...restaurantForm, cuisineType: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Complete Address</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={restaurantForm.address}
                        onChange={e => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Commission Share Rate (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={restaurantForm.commissionRate}
                        onChange={e => setRestaurantForm({ ...restaurantForm, commissionRate: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                      <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowRestaurantModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Restaurant</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* --- ADD RIDER MODAL --- */}
            {showRiderModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>Register Fleet Delivery Partner</h3>
                    <button className="modal-close" onClick={() => setShowRiderModal(false)}>&times;</button>
                  </div>
                  <form onSubmit={handleCreateRider}>
                    <div className="form-group">
                      <label>Rider Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={riderForm.name}
                        onChange={e => setRiderForm({ ...riderForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={riderForm.phone}
                        onChange={e => setRiderForm({ ...riderForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Vehicle Type</label>
                      <select
                        className="form-control"
                        value={riderForm.vehicleType}
                        onChange={e => setRiderForm({ ...riderForm, vehicleType: e.target.value })}
                      >
                        <option value="BIKE">Motorbike</option>
                        <option value="SCOOTER">Scooter</option>
                        <option value="CYCLE">Bicycle</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                      <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowRiderModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Register Rider</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* --- ADD CITY MODAL --- */}
            {showCityModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>Whitelist Operating City</h3>
                    <button className="modal-close" onClick={() => setShowCityModal(false)}>&times;</button>
                  </div>
                  <form onSubmit={handleCreateCity}>
                    <div className="form-group">
                      <label>City Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={cityForm.name}
                        onChange={e => setCityForm({ ...cityForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>State / Region</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={cityForm.state}
                        onChange={e => setCityForm({ ...cityForm, state: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                      <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCityModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Whitelist City</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* --- ADD CATEGORY MODAL --- */}
            {showCategoryModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>Add Food Category Tag</h3>
                    <button className="modal-close" onClick={() => setShowCategoryModal(false)}>&times;</button>
                  </div>
                  <form onSubmit={handleCreateCategory}>
                    <div className="form-group">
                      <label>Category Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={categoryForm.name}
                        onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Icon Emoji</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={categoryForm.icon}
                        onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                      <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCategoryModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Category</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* --- BROADCAST ANNOUNCEMENT MODAL --- */}
            {showAnnouncementModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>Broadcast Global Announcement</h3>
                    <button className="modal-close" onClick={() => setShowAnnouncementModal(false)}>&times;</button>
                  </div>
                  <form onSubmit={handleCreateAnnouncement}>
                    <div className="form-group">
                      <label>Announcement Title / Headline</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={announcementForm.title}
                        onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Message Content Body</label>
                      <textarea
                        className="form-control"
                        style={{ height: '120px', resize: 'vertical' }}
                        required
                        value={announcementForm.message}
                        onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                      <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAnnouncementModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Broadcast Now</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      {page !== 'shop-dashboard' && page !== 'delivery-rider' && (
        <footer style={{ background: '#070a12', borderTop: '1px solid var(--border-light)', padding: '4rem 2rem 2rem 2rem', marginTop: '5rem', color: 'var(--text-secondary)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem' }}>
            <div style={{ flex: '1 1 250px' }}>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem' }}>🍕 Cravora</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                State-of-the-art marketing and food delivery platform connecting foodies with local restaurants. Experience visual checkout and real-time tracking today.
              </p>
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '1rem' }}>Explore</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                <li style={{ cursor: 'pointer' }} onClick={() => setPage('home')}>Home Menu</li>
                <li style={{ cursor: 'pointer' }} onClick={() => setPage('offers')}>Discount Offers</li>
                <li style={{ cursor: 'pointer' }} onClick={() => setPage('cart')}>View Cart</li>
              </ul>
            </div>
            <div style={{ flex: '1 1 180px' }}>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '1rem' }}>Partnerships</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                  onClick={() => {
                    setAuthAsMerchant(true);
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                >
                  🤝 Partner Portal LogIn
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem', borderColor: '#3b82f6', color: '#3b82f6' }}
                  onClick={() => setPage('delivery-rider')}
                >
                  🚴 Rider Dispatch Portal
                </button>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '3rem', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
            &copy; 2026 Cravora Food Systems. All Rights Reserved. Built with high-end React &amp; Spring Boot.
          </div>
        </footer>
      )}

      {/* DYNAMIC AUTH POPUP MODAL */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.5rem' }}>
                {authAsMerchant ? 'Merchant Login' : authMode === 'login' ? 'Sign In' : 'Create Account'}
              </h3>
              <button className="modal-close" onClick={() => setShowAuthModal(false)}>
                &times;
              </button>
            </div>

            {/* Standard Login Tab */}
            {authMode === 'login' ? (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="name@email.com"
                    value={loginForm.email}
                    onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="Enter password"
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  Login
                </button>
                
                {!authAsMerchant && (
                  <div className="auth-footer" style={{ marginTop: '1.2rem' }}>
                    New to Cravora?{' '}
                    <span className="auth-link" onClick={() => setAuthMode('register')}>
                      Register here
                    </span>
                  </div>
                )}
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Enter full name"
                    value={registerForm.name}
                    onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="Enter email"
                    value={registerForm.email}
                    onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="Create secure password"
                    value={registerForm.password}
                    onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  Register Account
                </button>
                <div className="auth-footer" style={{ marginTop: '1.2rem' }}>
                  Already have an account?{' '}
                  <span className="auth-link" onClick={() => setAuthMode('login')}>
                    Login here
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FOOD ITEM MODAL (ADD / EDIT) */}
      {showFoodModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.4rem' }}>{editingFood ? 'Edit Menu Item' : 'Add New Food Item'}</h3>
              <button className="modal-close" onClick={() => setShowFoodModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveFood}>
              <div className="form-group">
                <label>Food Item Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Cheese Pizza"
                  value={foodForm.name}
                  onChange={e => setFoodForm({ ...foodForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  required
                  rows={3}
                  className="form-control"
                  placeholder="Provide ingredients or preparation details"
                  value={foodForm.description}
                  onChange={e => setFoodForm({ ...foodForm, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="form-control"
                  placeholder="Price in Rupees"
                  value={foodForm.price}
                  onChange={e => setFoodForm({ ...foodForm, price: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Food Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={e => setFoodForm({ ...foodForm, imageFile: e.target.files ? e.target.files[0] : null })}
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {editingFood ? 'Leave blank to keep existing image.' : 'Upload an appealing image.'}
                </small>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFoodModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFood ? 'Update Food' : 'Add Food'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMO OFFER MODAL */}
      {showOfferModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.4rem' }}>Launch New Promo Offer</h3>
              <button className="modal-close" onClick={() => setShowOfferModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateOffer}>
              <div className="form-group">
                <label>Promo Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. MONSOON40"
                  value={offerForm.code}
                  onChange={e => setOfferForm({ ...offerForm, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="form-group">
                <label>Headline Title</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Save 40% Off"
                  value={offerForm.title}
                  onChange={e => setOfferForm({ ...offerForm, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description Details</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Valid on all orders above ₹199."
                  value={offerForm.description}
                  onChange={e => setOfferForm({ ...offerForm, description: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Discount Ratio</label>
                  <select
                    className="form-control"
                    value={offerForm.discount}
                    onChange={e => setOfferForm({ ...offerForm, discount: e.target.value })}
                    required
                  >
                    <option value="">Select Discount</option>
                    <option value="0.10">10% OFF</option>
                    <option value="0.15">15% OFF</option>
                    <option value="0.20">20% OFF</option>
                    <option value="0.25">25% OFF</option>
                    <option value="0.30">30% OFF</option>
                    <option value="0.35">35% OFF</option>
                    <option value="0.40">40% OFF</option>
                    <option value="0.50">50% OFF</option>
                    <option value="0.60">60% OFF</option>
                    <option value="0.70">70% OFF</option>
                    <option value="0.80">80% OFF</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Promo Icon</label>
                  <select
                    className="form-control"
                    value={offerForm.icon}
                    onChange={e => setOfferForm({ ...offerForm, icon: e.target.value })}
                  >
                    <option value="🎉">🎉 Party</option>
                    <option value="🍕">🍕 Pizza</option>
                    <option value="🍔">🍔 Burger</option>
                    <option value="🍛">🍛 Curry</option>
                    <option value="🍰">🍰 Dessert</option>
                    <option value="💳">💳 Card</option>
                    <option value="🏷️">🏷️ Tag</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Category Tag</label>
                <select
                  className="form-control"
                  value={offerForm.tag}
                  onChange={e => setOfferForm({ ...offerForm, tag: e.target.value })}
                >
                  <option value="MOST POPULAR">MOST POPULAR</option>
                  <option value="SUPER DEALS">SUPER DEALS</option>
                  <option value="WEEKEND SPECIAL">WEEKEND SPECIAL</option>
                  <option value="LIMITED OFFER">LIMITED OFFER</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowOfferModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Launch Promo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
