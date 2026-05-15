import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";

import User from "../models/User.js";
import Pet from "../models/Pet.js";
import MedicalRecord from "../models/MedicalRecord.js";
import Vaccination from "../models/Vaccination.js";
import Appointment from "../models/Appointment.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import AdoptionPost from "../models/AdoptionPost.js";
import Blog from "../models/Blog.js";
import Discussion from "../models/Discussion.js";
import MatchRequest from "../models/MatchRequest.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import Review from "../models/Review.js";
import ContactInquiry from "../models/ContactInquiry.js";

dotenv.config();

const now = new Date();

const photoUrls = {
  dogHero: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85",
  catResting: "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=1200&q=85",
  rabbitPortrait: "https://images.unsplash.com/photo-1452857297128-d9c29adba80b?auto=format&fit=crop&w=1200&q=85",
  dogPortrait: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=85",
  catPortrait: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=85",
  productDogFood: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=1200&q=85",
  productCatLitter: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1200&q=85",
  productMultivitamin: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=85",
  productHarness: "https://images.unsplash.com/photo-1601758177260-31f70c8ddc9f?auto=format&fit=crop&w=1200&q=85",
  blogTeam: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85",
  blogHealth: "https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=1200&q=85",
  blogCommunity: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=85"
};

const userSeeds = [
  {
    key: "admin",
    name: "System Admin",
    email: "admin@petcare.demo",
    password: "password123",
    phone: "+94-77-100-1000",
    role: "admin",
    isEmailVerified: true,
    approvalStatus: "approved",
    approvedAt: now,
    bio: "Platform administrator"
  },
  {
    key: "ownerA",
    name: "Nimal Perera",
    email: "nimal.owner@petcare.demo",
    password: "password123",
    phone: "+94-77-200-1001",
    role: "petOwner",
    isEmailVerified: true,
    approvalStatus: "approved",
    address: "Colombo 05",
    bio: "Dog and cat parent"
  },
  {
    key: "ownerB",
    name: "Kavindi Fernando",
    email: "kavindi.owner@petcare.demo",
    password: "password123",
    phone: "+94-77-200-1002",
    role: "petOwner",
    isEmailVerified: true,
    approvalStatus: "approved",
    address: "Kandy",
    bio: "Rescue pet volunteer"
  },
  {
    key: "ownerC",
    name: "Ruwan Silva",
    email: "ruwan.owner@petcare.demo",
    password: "password123",
    phone: "+94-77-200-1003",
    role: "petOwner",
    isEmailVerified: true,
    approvalStatus: "approved",
    address: "Galle",
    bio: "Pet care enthusiast"
  },
  {
    key: "vetA",
    name: "Dr. Amara Jayasuriya",
    email: "amara.vet@petcare.demo",
    password: "password123",
    phone: "+94-77-300-1001",
    role: "veterinarian",
    isEmailVerified: true,
    approvalStatus: "approved",
    approvedAt: now,
    providerProfile: {
      businessName: "City Vet Care",
      licenseNumber: "SLVET-001",
      serviceArea: "Colombo",
      specialties: ["general", "surgery", "dermatology"]
    }
  },
  {
    key: "vetB",
    name: "Dr. Lahiru Senanayake",
    email: "lahiru.vet@petcare.demo",
    password: "password123",
    phone: "+94-77-300-1002",
    role: "veterinarian",
    isEmailVerified: true,
    approvalStatus: "approved",
    approvedAt: now,
    providerProfile: {
      businessName: "Healthy Paws Clinic",
      licenseNumber: "SLVET-002",
      serviceArea: "Kandy",
      specialties: ["vaccination", "nutrition"]
    }
  },
  {
    key: "shopA",
    name: "PawMart Store",
    email: "pawmart.shop@petcare.demo",
    password: "password123",
    phone: "+94-77-400-1001",
    role: "petShop",
    isEmailVerified: true,
    approvalStatus: "approved",
    approvedAt: now,
    providerProfile: {
      businessName: "PawMart",
      licenseNumber: "SHOP-001",
      serviceArea: "Islandwide",
      specialties: ["food", "toys", "supplements"]
    }
  },
  {
    key: "groomerA",
    name: "Cuddle Groom Studio",
    email: "cuddle.groom@petcare.demo",
    password: "password123",
    phone: "+94-77-500-1001",
    role: "groomer",
    isEmailVerified: true,
    approvalStatus: "approved",
    approvedAt: now,
    providerProfile: {
      businessName: "Cuddle Groom Studio",
      licenseNumber: "GRM-001",
      serviceArea: "Colombo",
      specialties: ["full-groom", "fur-trim", "spa"]
    }
  }
];

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function clearDatabase() {
  await Promise.all([
    Review.deleteMany({}),
    Notification.deleteMany({}),
    Message.deleteMany({}),
    MatchRequest.deleteMany({}),
    Discussion.deleteMany({}),
    Blog.deleteMany({}),
    AdoptionPost.deleteMany({}),
    Order.deleteMany({}),
    Product.deleteMany({}),
    Appointment.deleteMany({}),
    Vaccination.deleteMany({}),
    MedicalRecord.deleteMany({}),
    Pet.deleteMany({}),
    User.deleteMany({})
    , ContactInquiry.deleteMany({})
  ]);
}

async function seedDatabase() {
  console.log("Seeding database...");

  await clearDatabase();

  const usersByKey = {};
  for (const data of userSeeds) {
    const { key, ...payload } = data;
    const user = await User.create(payload);
    usersByKey[key] = user;
  }

  usersByKey.ownerA.approvedBy = usersByKey.admin._id;
  usersByKey.ownerB.approvedBy = usersByKey.admin._id;
  usersByKey.ownerC.approvedBy = usersByKey.admin._id;
  usersByKey.vetA.approvedBy = usersByKey.admin._id;
  usersByKey.vetB.approvedBy = usersByKey.admin._id;
  usersByKey.shopA.approvedBy = usersByKey.admin._id;
  usersByKey.groomerA.approvedBy = usersByKey.admin._id;
  await Promise.all(Object.values(usersByKey).map((user) => user.save()));

  const pets = await Pet.create([
    {
      owner: usersByKey.ownerA._id,
      name: "Max",
      species: "dog",
      breed: "Golden Retriever",
      age: 5,
      gender: "male",
      images: [photoUrls.dogPortrait],
      vaccinationStatus: "upToDate",
      medicalHistory: "Mild seasonal allergies",
      microchipId: "MC-1001",
      location: { city: "Colombo", coordinates: { lat: 6.9271, lng: 79.8612 } },
      matchProfile: { isLooking: true, preferredBreed: "Golden Retriever", preferredGender: "female", preferredAgeMin: 3, preferredAgeMax: 6, notes: "Friendly temperament" }
    },
    {
      owner: usersByKey.ownerA._id,
      name: "Milo",
      species: "cat",
      breed: "Domestic Shorthair",
      age: 2,
      gender: "male",
      images: [photoUrls.catResting],
      vaccinationStatus: "dueSoon",
      medicalHistory: "No major conditions",
      microchipId: "MC-1002",
      location: { city: "Colombo", coordinates: { lat: 6.9, lng: 79.88 } },
      matchProfile: { isLooking: false }
    },
    {
      owner: usersByKey.ownerB._id,
      name: "Bella",
      species: "dog",
      breed: "Labrador",
      age: 3,
      gender: "female",
      images: [photoUrls.dogHero],
      vaccinationStatus: "upToDate",
      medicalHistory: "Recovered from ear infection",
      microchipId: "MC-2001",
      location: { city: "Kandy", coordinates: { lat: 7.2906, lng: 80.6337 } },
      matchProfile: { isLooking: true, preferredBreed: "Labrador", preferredGender: "male", preferredAgeMin: 2, preferredAgeMax: 5, notes: "Calm and playful" }
    },
    {
      owner: usersByKey.ownerB._id,
      name: "Coco",
      species: "rabbit",
      breed: "Lionhead",
      age: 1,
      gender: "female",
      images: [photoUrls.rabbitPortrait],
      vaccinationStatus: "unknown",
      medicalHistory: "New rescue",
      microchipId: "MC-2002",
      location: { city: "Kandy", coordinates: { lat: 7.31, lng: 80.62 } },
      matchProfile: { isLooking: false }
    },
    {
      owner: usersByKey.ownerC._id,
      name: "Rocky",
      species: "dog",
      breed: "Beagle",
      age: 4,
      gender: "male",
      images: [photoUrls.dogPortrait],
      vaccinationStatus: "overdue",
      medicalHistory: "Weight management plan",
      microchipId: "MC-3001",
      location: { city: "Galle", coordinates: { lat: 6.0535, lng: 80.221 } },
      matchProfile: { isLooking: true, preferredBreed: "Beagle", preferredGender: "female", preferredAgeMin: 2, preferredAgeMax: 6, notes: "Energetic" }
    },
    {
      owner: usersByKey.ownerC._id,
      name: "Luna",
      species: "cat",
      breed: "Persian",
      age: 2,
      gender: "female",
      images: [photoUrls.catPortrait],
      vaccinationStatus: "upToDate",
      medicalHistory: "Routine checkups only",
      microchipId: "MC-3002",
      location: { city: "Galle", coordinates: { lat: 6.07, lng: 80.23 } },
      matchProfile: { isLooking: false }
    }
  ]);

  const petByName = Object.fromEntries(pets.map((pet) => [pet.name, pet]));

  await MedicalRecord.create([
    {
      pet: petByName.Max._id,
      veterinarian: usersByKey.vetA._id,
      visitDate: daysFromNow(-40),
      diagnosis: "Seasonal allergy flare",
      treatment: "Antihistamine and topical care",
      prescriptions: ["Cetirizine 5mg"],
      documents: ["uploads/max-allergy-report.pdf"],
      vetNotes: "Avoid grass exposure in evenings",
      nextVisitDate: daysFromNow(20),
      healthAlerts: ["Monitor itching"]
    },
    {
      pet: petByName.Bella._id,
      veterinarian: usersByKey.vetB._id,
      visitDate: daysFromNow(-25),
      diagnosis: "Routine wellness check",
      treatment: "No treatment required",
      prescriptions: [],
      documents: ["uploads/bella-wellness-check.pdf"],
      vetNotes: "Healthy status",
      nextVisitDate: daysFromNow(60),
      healthAlerts: []
    },
    {
      pet: petByName.Rocky._id,
      veterinarian: usersByKey.vetA._id,
      visitDate: daysFromNow(-10),
      diagnosis: "Weight above ideal range",
      treatment: "Diet adjustment and daily walks",
      prescriptions: ["Omega supplement"],
      documents: ["uploads/rocky-diet-plan.pdf"],
      vetNotes: "Recheck in 30 days",
      nextVisitDate: daysFromNow(30),
      healthAlerts: ["Weight control"]
    }
  ]);

  await Vaccination.create([
    {
      pet: petByName.Max._id,
      vaccineName: "Rabies",
      administeredDate: daysFromNow(-180),
      nextDueDate: daysFromNow(185),
      status: "completed",
      reminderSent: false,
      notes: "Booster completed"
    },
    {
      pet: petByName.Milo._id,
      vaccineName: "FVRCP",
      administeredDate: daysFromNow(-330),
      nextDueDate: daysFromNow(12),
      status: "scheduled",
      reminderSent: true,
      notes: "Annual booster due soon"
    },
    {
      pet: petByName.Rocky._id,
      vaccineName: "DHPP",
      administeredDate: daysFromNow(-420),
      nextDueDate: daysFromNow(-10),
      status: "overdue",
      reminderSent: true,
      notes: "Contact owner urgently"
    }
  ]);

  await Appointment.create([
    {
      pet: petByName.Max._id,
      owner: usersByKey.ownerA._id,
      provider: usersByKey.vetA._id,
      serviceType: "vet",
      scheduledAt: daysFromNow(1),
      status: "confirmed",
      notes: "Follow-up for allergy",
      location: "City Vet Care - Colombo"
    },
    {
      pet: petByName.Bella._id,
      owner: usersByKey.ownerB._id,
      provider: usersByKey.vetB._id,
      serviceType: "vet",
      scheduledAt: daysFromNow(2),
      status: "pending",
      notes: "Vaccination consultation",
      location: "Healthy Paws Clinic - Kandy"
    },
    {
      pet: petByName.Rocky._id,
      owner: usersByKey.ownerC._id,
      provider: usersByKey.groomerA._id,
      serviceType: "grooming",
      scheduledAt: daysFromNow(3),
      status: "confirmed",
      notes: "Nail trim and bath",
      location: "Cuddle Groom Studio"
    },
    {
      pet: petByName.Luna._id,
      owner: usersByKey.ownerC._id,
      provider: usersByKey.vetA._id,
      serviceType: "vet",
      scheduledAt: daysFromNow(-3),
      status: "completed",
      notes: "Routine check",
      location: "City Vet Care - Colombo"
    }
  ]);

  const products = await Product.create([
    {
      seller: usersByKey.shopA._id,
      name: "Premium Dog Food 5kg",
      brand: "PawNutrition",
      category: "Dog Food",
      description: "Balanced nutrition for adult dogs",
      price: 7800,
      stock: 48,
      lowStockThreshold: 10,
      images: [photoUrls.productDogFood],
      rating: 4.6,
      reviewCount: 12,
      isActive: true,
      approvalStatus: "approved",
      reviewedAt: now,
      reviewedBy: usersByKey.admin._id
    },
    {
      seller: usersByKey.shopA._id,
      name: "Cat Litter 10L",
      brand: "CleanPaws",
      category: "Cat Supplies",
      description: "Low-dust natural litter",
      price: 3200,
      stock: 34,
      lowStockThreshold: 8,
      images: [photoUrls.productCatLitter],
      rating: 4.3,
      reviewCount: 9,
      isActive: true,
      approvalStatus: "approved",
      reviewedAt: now,
      reviewedBy: usersByKey.admin._id
    },
    {
      seller: usersByKey.shopA._id,
      name: "Vet Recommended Multivitamin",
      brand: "VitaPet",
      category: "Health Devices",
      description: "Daily immune support",
      price: 2100,
      stock: 65,
      lowStockThreshold: 15,
      images: [photoUrls.productMultivitamin],
      rating: 4.7,
      reviewCount: 21,
      isActive: true,
      approvalStatus: "approved",
      reviewedAt: now,
      reviewedBy: usersByKey.admin._id
    },
    {
      seller: usersByKey.shopA._id,
      name: "Comfort Harness",
      brand: "WalkEase",
      category: "Accessories",
      description: "No-pull padded harness",
      price: 2900,
      stock: 22,
      lowStockThreshold: 6,
      images: [photoUrls.productHarness],
      rating: 4.5,
      reviewCount: 15,
      isActive: true,
      approvalStatus: "approved",
      reviewedAt: now,
      reviewedBy: usersByKey.admin._id
    }
  ]);

  const productByName = Object.fromEntries(products.map((product) => [product.name, product]));

  const orders = await Order.create([
    {
      user: usersByKey.ownerA._id,
      shippingName: "Nimal Perera",
      shippingEmail: usersByKey.ownerA.email,
      shippingPhone: usersByKey.ownerA.phone,
      shippingAddress: "No. 18, Colombo 05",
      paymentMethod: "card",
      paymentLast4: "4242",
      estimatedDeliveryAt: daysFromNow(4),
      trackingNumber: "TRK-DEMO-1001",
      trackingHistory: [
        { status: "placed", message: "Order placed successfully", timestamp: daysFromNow(-2) },
        { status: "processing", message: "Payment confirmed", timestamp: daysFromNow(-1) }
      ],
      items: [
        { product: productByName["Premium Dog Food 5kg"]._id, quantity: 1, price: 7800 },
        { product: productByName["Comfort Harness"]._id, quantity: 1, price: 2900 }
      ],
      total: 10700,
      paymentStatus: "paid",
      orderStatus: "processing",
      notes: "Please call before delivery"
    },
    {
      user: usersByKey.ownerB._id,
      shippingName: "Kavindi Fernando",
      shippingEmail: usersByKey.ownerB.email,
      shippingPhone: usersByKey.ownerB.phone,
      shippingAddress: "No. 42, Kandy",
      paymentMethod: "cod",
      estimatedDeliveryAt: daysFromNow(3),
      trackingNumber: "TRK-DEMO-1002",
      trackingHistory: [
        { status: "placed", message: "COD order awaiting confirmation", timestamp: daysFromNow(-1) }
      ],
      items: [
        { product: productByName["Cat Litter 10L"]._id, quantity: 2, price: 3200 }
      ],
      total: 6400,
      paymentStatus: "pending",
      orderStatus: "placed",
      notes: "Deliver after 5 PM"
    }
  ]);

  await AdoptionPost.create([
    {
      pet: petByName.Coco._id,
      postedBy: usersByKey.ownerB._id,
      title: "Friendly rescued rabbit needs a loving home",
      description: "Coco is calm, friendly with kids, and litter trained.",
      adoptionFee: 1500,
      location: "Kandy",
      status: "open",
      requests: [
        {
          user: usersByKey.ownerA._id,
          applicantName: "Nimal Perera",
          applicantEmail: usersByKey.ownerA.email,
          applicantPhone: usersByKey.ownerA.phone,
          applicantAddress: "Colombo 05",
          homeType: "Apartment",
          experience: "Previously cared for rabbits and cats.",
          message: "I can provide a safe indoor space and regular vet care.",
          status: "pending"
        }
      ]
    },
    {
      pet: petByName.Luna._id,
      postedBy: usersByKey.ownerC._id,
      title: "Calm Persian cat available for adoption",
      description: "Luna is affectionate and fully vaccinated.",
      adoptionFee: 2000,
      location: "Galle",
      status: "adopted",
      requests: [
        {
          user: usersByKey.ownerB._id,
          applicantName: "Kavindi Fernando",
          applicantEmail: usersByKey.ownerB.email,
          applicantPhone: usersByKey.ownerB.phone,
          applicantAddress: "Kandy",
          homeType: "House with garden",
          experience: "Cat owner for 6 years.",
          message: "Happy to adopt Luna and continue her current care routine.",
          status: "approved"
        }
      ]
    },
    {
      pet: petByName.Rocky._id,
      postedBy: usersByKey.ownerC._id,
      title: "Beagle needs active family",
      description: "Rocky is playful and needs daily walks.",
      adoptionFee: 1200,
      location: "Galle",
      status: "pendingApproval",
      requests: []
    }
  ]);

  const blogs = await Blog.create([
    {
      author: usersByKey.admin._id,
      title: "Welcome to the New Pet Care Platform",
      body: "This release introduces role-specific dashboards, better adoption workflows, and improved records management.",
      tags: ["platform", "release", "updates"],
      image: photoUrls.blogTeam,
      status: "published",
      likes: [usersByKey.ownerA._id, usersByKey.ownerB._id],
      comments: [
        { user: usersByKey.ownerA._id, body: "Great update!" },
        { user: usersByKey.vetA._id, body: "Vet workflow is much smoother now." }
      ]
    },
    {
      author: usersByKey.vetA._id,
      title: "How to Keep Vaccination Records Up to Date",
      body: "Regular reminders and vet follow-ups can prevent missed doses.",
      tags: ["health", "vaccination"],
      image: photoUrls.blogHealth,
      status: "published",
      likes: [usersByKey.ownerC._id],
      comments: [{ user: usersByKey.ownerC._id, body: "Very useful checklist." }]
    },
    {
      author: usersByKey.admin._id,
      title: "Community Guidelines Draft",
      body: "Please review moderation rules for responsible discussion.",
      tags: ["community"],
      image: photoUrls.blogCommunity,
      status: "draft",
      likes: [],
      comments: []
    }
  ]);

    await ContactInquiry.create([
      {
        name: "Rashmi Perera",
        email: "rashmi@example.com",
        role: "petOwner",
        subject: "Need help with adoption request",
        message: "I submitted an adoption request and would like to know the next steps.",
        status: "new"
      },
      {
        name: "PawMart Support",
        email: "support@pawmart.example",
        role: "petShop",
        subject: "Marketplace listing approval",
        message: "Please review our new product submissions and share any missing details.",
        status: "inReview"
      }
    ]);

  await Discussion.create([
    {
      author: usersByKey.ownerA._id,
      title: "Best diet for a 5-year-old Golden Retriever?",
      body: "Looking for recommendations that support joints and skin health.",
      tags: ["nutrition", "dogs"],
      status: "open",
      likes: [usersByKey.ownerB._id, usersByKey.vetA._id],
      replies: [
        { user: usersByKey.vetA._id, body: "Try high-protein formulas with omega fatty acids." },
        { user: usersByKey.ownerB._id, body: "My lab improved with fish-based feed." }
      ]
    },
    {
      author: usersByKey.ownerC._id,
      title: "Tips for reducing cat stress during travel",
      body: "Any safe strategies for short road trips?",
      tags: ["cats", "travel"],
      status: "open",
      likes: [usersByKey.ownerA._id],
      replies: [{ user: usersByKey.vetB._id, body: "Use a familiar carrier and short acclimation sessions." }]
    }
  ]);

  await MatchRequest.create([
    {
      requesterPet: petByName.Max._id,
      targetPet: petByName.Bella._id,
      message: "Max is friendly and healthy. Interested in a supervised meet-up.",
      status: "accepted"
    },
    {
      requesterPet: petByName.Rocky._id,
      targetPet: petByName.Bella._id,
      message: "Rocky would be a good active match.",
      status: "pending"
    }
  ]);

  await Message.create([
    {
      sender: usersByKey.ownerA._id,
      receiver: usersByKey.vetA._id,
      relatedPet: petByName.Max._id,
      body: "Can we move Max's appointment to evening?",
      readAt: null
    },
    {
      sender: usersByKey.vetA._id,
      receiver: usersByKey.ownerA._id,
      relatedPet: petByName.Max._id,
      body: "Yes, I can offer a 6:30 PM slot.",
      readAt: now
    },
    {
      sender: usersByKey.ownerB._id,
      receiver: usersByKey.shopA._id,
      body: "Do you have larger litter packs in stock?",
      readAt: null
    }
  ]);

  await Notification.create([
    {
      user: usersByKey.ownerA._id,
      title: "Appointment confirmed",
      message: "Max's vet appointment is confirmed for tomorrow.",
      type: "appointment",
      channel: "inApp"
    },
    {
      user: usersByKey.ownerB._id,
      title: "Vaccination due soon",
      message: "Milo's vaccination is due within two weeks.",
      type: "vaccination",
      channel: "inApp"
    },
    {
      user: usersByKey.shopA._id,
      title: "New order received",
      message: "You have received a new order from Nimal Perera.",
      type: "order",
      relatedOrder: orders[0]._id,
      channel: "inApp"
    },
    {
      user: usersByKey.admin._id,
      title: "Daily moderation summary",
      message: "2 new community discussions need review.",
      type: "system",
      channel: "inApp"
    }
  ]);

  await Review.create([
    {
      user: usersByKey.ownerA._id,
      targetType: "product",
      targetId: productByName["Premium Dog Food 5kg"]._id,
      rating: 5,
      comment: "My dog loves it. Great quality."
    },
    {
      user: usersByKey.ownerB._id,
      targetType: "product",
      targetId: productByName["Cat Litter 10L"]._id,
      rating: 4,
      comment: "Low dust and easy to clean."
    },
    {
      user: usersByKey.ownerC._id,
      targetType: "provider",
      targetId: usersByKey.vetA._id,
      rating: 5,
      comment: "Very professional and caring vet."
    }
  ]);

  console.log("Seed completed successfully.");
  console.log(`Users: ${await User.countDocuments()}`);
  console.log(`Pets: ${await Pet.countDocuments()}`);
  console.log(`Medical records: ${await MedicalRecord.countDocuments()}`);
  console.log(`Vaccinations: ${await Vaccination.countDocuments()}`);
  console.log(`Appointments: ${await Appointment.countDocuments()}`);
  console.log(`Products: ${await Product.countDocuments()}`);
  console.log(`Orders: ${await Order.countDocuments()}`);
  console.log(`Adoption posts: ${await AdoptionPost.countDocuments()}`);
  console.log(`Blogs: ${blogs.length}`);
}

async function destroyDatabase() {
  await clearDatabase();
  console.log("Database cleared successfully.");
}

async function run() {
  try {
    await connectDB();
    if (process.argv.includes("--destroy")) {
      await destroyDatabase();
    } else {
      await seedDatabase();
    }
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed script failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

run();
