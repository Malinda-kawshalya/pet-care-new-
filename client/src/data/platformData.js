import {
  Activity,
  Bell,
  CalendarCheck,
  CreditCard,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  LockKeyhole,
  MapPinned,
  MessageCircle,
  PawPrint,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Users
} from "lucide-react";

export const roles = [
  {
    id: "petOwner",
    label: "Pet Owner",
    scope: "Own pets, bookings, orders, match requests, adoption requests, community posts",
    permissions: ["Manage own pets", "Book services", "Buy products", "Send match/adoption requests", "Receive reminders"]
  },
  {
    id: "veterinarian",
    label: "Veterinarian",
    scope: "Medical records, vaccination plans, prescriptions, vet notes, appointment slots",
    permissions: ["Update health records", "Upload prescriptions", "Approve medical notes", "Manage vet schedule"]
  },
  {
    id: "petShop",
    label: "Pet Shop",
    scope: "Products, inventory, orders, promotions, product reviews",
    permissions: ["Manage products", "Track stock", "Process orders", "Reply to reviews"]
  },
  {
    id: "groomer",
    label: "Groomer",
    scope: "Grooming services, availability, service bookings, appointment history",
    permissions: ["Publish service slots", "Accept bookings", "Reschedule visits", "Send service reminders"]
  },
  {
    id: "admin",
    label: "Admin",
    scope: "Whole platform governance, approvals, analytics, reports, moderation, security",
    permissions: ["Approve users", "Block unsafe accounts", "Moderate content", "Generate reports", "Manage roles"]
  }
];

export const modules = [
  // {
  //   id: "auth",
  //   title: "Authentication",
  //   icon: ShieldCheck,
  //   tone: "violet",
  //   collection: "Users",
  //   summary: "Registration, login, approval, roles, and secure account settings.",
  //   features: ["User registration", "Login / logout", "Forgot password", "Profile management", "Change password", "Admin approval", "Role management"],
  //   workflows: ["Register with role", "Wait for provider approval", "Login with JWT", "Update profile and password"],
  //   actions: ["Create account", "Approve provider", "Block user", "Reset password"],
  //   permissions: ["Public registration", "Owner self-service", "Admin-only approval"]
  // },
  {
    id: "pets",
    title: "Pet Profiles",
    icon: PawPrint,
    tone: "amber",
    collection: "Pets",
    summary: "Complete pet identity, images, vaccination state, breed, age, and health background.",
    features: ["Add pet profile", "Edit pet profile", "Delete pet profile", "Upload pet images", "Breed and age", "Gender", "Vaccination status", "Medical history"],
    workflows: ["Create pet record", "Upload profile image", "Attach medical history", "Share QR record with vet"],
    actions: ["Add pet", "Update details", "Archive pet", "Upload image"],
    permissions: ["Pet owner owns profile", "Vet can view assigned records", "Admin can audit"]
  },
  {
    id: "health",
    title: "Health Records",
    icon: Stethoscope,
    tone: "mint",
    collection: "MedicalRecords, Vaccinations",
    summary: "Medical records, vet notes, prescription uploads, health history, and reminders.",
    features: ["Add medical records", "Update records", "Upload prescriptions", "Vaccination tracking", "Vaccination reminders", "Health alerts", "Health history", "Vet notes"],
    workflows: ["Vet adds diagnosis", "Prescription file is uploaded", "Next vaccine date predicted", "Owner receives reminder"],
    actions: ["New diagnosis", "Upload document", "Schedule booster", "Create alert"],
    permissions: ["Vet writes notes", "Owner reads own records", "Admin monitors safety"]
  },
  {
    id: "appointments",
    title: "Appointments",
    icon: CalendarCheck,
    tone: "blue",
    collection: "Appointments",
    summary: "Search vets, groomers, and trainers, then book, reschedule, or cancel visits.",
    features: ["Search nearby services", "View time slots", "Book appointment", "Cancel appointment", "Reschedule appointment", "Confirmation", "Reminder notifications", "Booking history"],
    workflows: ["Find provider", "Select slot", "Confirm booking", "Receive reminder", "Complete visit"],
    actions: ["Book", "Cancel", "Reschedule", "Confirm"],
    permissions: ["Owner books", "Provider manages slots", "Admin resolves disputes"]
  },
  // {
  //   id: "marketplace",
  //   title: "Marketplace",
  //   icon: ShoppingBag,
  //   tone: "rose",
  //   collection: "Products, Orders, Reviews",
  //   summary: "Pet products, carts, checkout, seller inventory, reviews, and order tracking.",
  //   features: ["Browse products", "Search products", "Filter products", "Add to cart", "Checkout", "Online payment", "Order tracking", "Reviews and ratings", "Seller product management", "Inventory management"],
  //   workflows: ["Browse catalog", "Add to cart", "Pay securely", "Track delivery", "Review product"],
  //   actions: ["Add product", "Update stock", "Process payment", "Ship order"],
  //   permissions: ["Owners buy", "Pet shops sell", "Admin manages disputes"]
  // },
  // {
  //   id: "matchmaking",
  //   title: "Find a Mate",
  //   icon: HeartHandshake,
  //   tone: "pink",
  //   collection: "MatchRequests, Messages",
  //   summary: "Verified pet matching by breed, gender, age, location, and safe request flows.",
  //   features: ["Create pet match profile", "Search by breed", "Search by gender", "Search by age", "Search by location", "Send requests", "Accept/reject", "Chat/contact", "Verification", "Report unsafe users"],
  //   workflows: ["Publish match profile", "Filter compatible pets", "Send verified request", "Chat after approval", "Report unsafe activity"],
  //   actions: ["Send match request", "Accept", "Reject", "Report"],
  //   permissions: ["Verified owners only", "Chat after accepted request", "Admin handles reports"]
  // },
  {
    id: "adoption",
    title: "Adoption",
    icon: Users,
    tone: "green",
    collection: "AdoptionPosts",
    summary: "Adoption posts, browsing, request approval, and owner or shelter contact workflows.",
    features: ["Post pets for adoption", "Browse listings", "Adoption request submission", "Contact owners", "Contact shelters", "Approval management"],
    workflows: ["Post listing", "Review adopter request", "Approve request", "Share contact details", "Close adoption"],
    actions: ["Create listing", "Submit request", "Approve adopter", "Archive listing"],
    permissions: ["Owners and shelters post", "Users request adoption", "Admin approves flagged listings"]
  },
  // {
  //   id: "community",
  //   title: "Community",
  //   icon: MessageCircle,
  //   tone: "orange",
  //   collection: "Blogs",
  //   summary: "Blogs, pet care articles, tips, comments, shares, discussions, and moderation.",
  //   features: ["Create blog posts", "View articles", "Comment on posts", "Like/share posts", "Pet care tips", "Community discussions", "Admin content moderation"],
  //   workflows: ["Write article", "Publish tips", "Discuss with owners", "Moderate flagged content"],
  //   actions: ["Publish post", "Comment", "Like", "Moderate"],
  //   permissions: ["Users create content", "Admins moderate", "Experts publish verified tips"]
  // },
  // {
  //   id: "notifications",
  //   title: "Notifications",
  //   icon: Bell,
  //   tone: "cyan",
  //   collection: "Notifications",
  //   summary: "Email and push reminders for vaccines, appointments, emergencies, and promotions.",
  //   features: ["Vaccination reminders", "Appointment notifications", "Product promotions", "Emergency alerts", "Push notifications", "Email notifications"],
  //   workflows: ["Generate trigger", "Choose channel", "Send notification", "Track read status"],
  //   actions: ["Send vaccine reminder", "Send appointment alert", "Broadcast emergency", "Mark as read"],
  //   permissions: ["System creates reminders", "Admin sends alerts", "Users control preferences"]
  // },
  // {
  //   id: "locations",
  //   title: "Maps",
  //   icon: MapPinned,
  //   tone: "lime",
  //   collection: "Provider locations",
  //   summary: "Nearby vets, grooming centers, pet shops, map display, and navigation assistance.",
  //   features: ["Find nearby vets", "Find grooming centers", "Find pet shops", "Display location on map", "Navigation assistance"],
  //   workflows: ["Share location", "Search service radius", "Open provider profile", "Navigate to center"],
  //   actions: ["Search nearby", "Filter by service", "Open map", "Start directions"],
  //   permissions: ["Users search", "Providers maintain location", "Admin verifies service address"]
  // },
  // {
  //   id: "admin",
  //   title: "Admin",
  //   icon: LayoutDashboard,
  //   tone: "slate",
  //   collection: "All collections",
  //   summary: "User approval, product management, appointments, reports, analytics, and moderation.",
  //   features: ["User management", "Approve/block users", "Manage products", "Manage appointments", "Monitor reports", "View analytics", "Content moderation", "Generate reports"],
  //   workflows: ["Review account queue", "Approve or block", "Moderate reports", "Export analytics", "Audit security"],
  //   actions: ["Approve user", "Block account", "Moderate post", "Export report"],
  //   permissions: ["Admin only", "Role-based control", "Audit logged"]
  // },
  // {
  //   id: "ai",
  //   title: "Smart AI",
  //   icon: Sparkles,
  //   tone: "purple",
  //   collection: "AI recommendations",
  //   summary: "Vaccination prediction, health risk alerts, diet suggestions, trends, and chatbot advice.",
  //   features: ["Predict vaccination dates", "Health risk alerts", "Smart reminder suggestions", "Personalized recommendations", "Disease trend analysis", "AI chatbot", "Diet recommendations"],
  //   workflows: ["Analyze pet profile", "Predict next vaccine", "Recommend diet", "Detect health trend", "Show chatbot advice"],
  //   actions: ["Run prediction", "Create alert", "Suggest diet", "Ask chatbot"],
  //   permissions: ["Owner receives suggestions", "Vet reviews medical alerts", "Admin monitors trends"]
  // },
  // {
  //   id: "security",
  //   title: "Security",
  //   icon: LockKeyhole,
  //   tone: "red",
  //   collection: "Security controls",
  //   summary: "Authorization, encrypted data, secure payments, backups, verification, and fraud controls.",
  //   features: ["Authentication and authorization", "Data encryption", "Secure payments", "Backup and recovery", "User verification", "Spam and fraud detection"],
  //   workflows: ["Authorize route", "Validate role", "Encrypt sensitive data", "Verify payments", "Run backup"],
  //   actions: ["Audit permissions", "Verify user", "Flag fraud", "Restore backup"],
  //   permissions: ["JWT protected APIs", "Role checks", "Admin audit"]
  // }
];

export const products = [
  {
    name: "MocSup Dry Food",
    category: "Dog food",
    price: 26.0,
    stock: "148 in stock",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Chicken Gravy",
    category: "Cat nutrition",
    price: 18.0,
    stock: "82 in stock",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1571566882372-1598d88abd90?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Wellness Treats",
    category: "Training treats",
    price: 12.0,
    stock: "Low stock",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Smart Pet Collar",
    category: "Health device",
    price: 44.0,
    stock: "35 in stock",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=700&q=80"
  }
];

export const services = [
  { title: "Vaccination Due", value: "8 pets", detail: "This week", accent: "violet" },
  { title: "Appointments", value: "24", detail: "Vet, grooming, training", accent: "blue" },
  { title: "Orders", value: "132", detail: "Marketplace sales", accent: "rose" },
  { title: "Adoptions", value: "17", detail: "Pending approval", accent: "green" },
  { title: "Reports", value: "3", detail: "Unsafe user reviews", accent: "red" },
  { title: "AI Alerts", value: "11", detail: "Risk and reminder suggestions", accent: "purple" }
];

export const petProfiles = [
  { name: "Bella", type: "Golden Retriever", age: "3 years", gender: "Female", vaccine: "Rabies booster due", owner: "Janith Silva", status: "High priority" },
  { name: "Milo", type: "Persian Cat", age: "2 years", gender: "Male", vaccine: "Fully vaccinated", owner: "Monisha Rao", status: "Healthy" },
  { name: "Rocky", type: "German Shepherd", age: "5 years", gender: "Male", vaccine: "Deworming due", owner: "Felic Duarte", status: "Monitor" }
];

export const appointments = [
  { pet: "Bella", service: "Vaccination appointment", provider: "Dr. Perera", time: "09:30 AM", status: "Confirmed" },
  { pet: "Milo", service: "Grooming appointment", provider: "Paw Studio", time: "11:00 AM", status: "Pending" },
  { pet: "Rocky", service: "Health review", provider: "City Vet Care", time: "01:15 PM", status: "Reschedule requested" },
  { pet: "Luna", service: "Adoption meet", provider: "Happy Shelter", time: "03:45 PM", status: "Review" }
];

export const adminQueues = [
  { title: "Provider approvals", value: "9", detail: "Veterinarians, shops, groomers waiting" },
  { title: "Content moderation", value: "14", detail: "Blog comments and community posts" },
  { title: "Payment review", value: "5", detail: "Orders needing secure payment checks" },
  { title: "Unsafe reports", value: "3", detail: "Matchmaking and chat reports" }
];

export const advancedFeatures = [
  { title: "AI chatbot", icon: Sparkles, detail: "Pet care advice using profile, age, breed, and medical context." },
  { title: "QR medical record", icon: QrCode, detail: "Scan a pet tag to open emergency medical history." },
  { title: "Real-time vet chat", icon: MessageCircle, detail: "Message veterinarians after booking or accepted requests." },
  { title: "Emergency SOS", icon: Activity, detail: "Send urgent location and pet profile to nearby providers." },
  { title: "Diet recommendation", icon: FileText, detail: "Suggest food plans based on breed, age, weight, and risks." },
  { title: "Secure payments", icon: CreditCard, detail: "Checkout-ready payment flow with order and fraud checks." }
];

export const databaseTables = [
  "Users",
  "Pets",
  "MedicalRecords",
  "Vaccinations",
  "Appointments",
  "Products",
  "Orders",
  "MatchRequests",
  "AdoptionPosts",
  "Blogs",
  "Notifications",
  "Reviews",
  "Messages"
];
