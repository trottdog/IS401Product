import { Building, Category, Club, Event, ClubMembership, Announcement } from "@/lib/types";

export const BUILDINGS: Building[] = [
  { id: "b1", name: "Talmage Building", abbreviation: "TMCB", latitude: 40.2497, longitude: -111.6494, address: "756 E University Pkwy" },
  { id: "b2", name: "Wilkinson Student Center", abbreviation: "WSC", latitude: 40.2519, longitude: -111.6493, address: "1060 N 1200 E" },
  { id: "b3", name: "Harold B. Lee Library", abbreviation: "HBLL", latitude: 40.2488, longitude: -111.6494, address: "2060 Harold B. Lee Library" },
  { id: "b4", name: "Smith Fieldhouse", abbreviation: "SFH", latitude: 40.2531, longitude: -111.6458, address: "269 Student Athlete Building" },
  { id: "b5", name: "Benson Building", abbreviation: "BNSN", latitude: 40.2505, longitude: -111.6512, address: "754 E University Pkwy" },
  { id: "b6", name: "Joseph Smith Building", abbreviation: "JSB", latitude: 40.2502, longitude: -111.6475, address: "270 JSB" },
  { id: "b7", name: "Marriott Center", abbreviation: "MC", latitude: 40.2533, longitude: -111.6483, address: "Marriott Center" },
  { id: "b8", name: "Harris Fine Arts Center", abbreviation: "HFAC", latitude: 40.2504, longitude: -111.6525, address: "Harris Fine Arts Center" },
  { id: "b9", name: "Engineering Building", abbreviation: "EB", latitude: 40.2475, longitude: -111.6469, address: "450 Engineering Building" },
  { id: "b10", name: "Crabtree Technology Building", abbreviation: "CTB", latitude: 40.2470, longitude: -111.6485, address: "Crabtree Technology Building" },
];

export const CATEGORIES: Category[] = [
  { id: "c1", name: "Academic", icon: "school" },
  { id: "c2", name: "Social", icon: "people" },
  { id: "c3", name: "Sports", icon: "fitness-center" },
  { id: "c4", name: "Arts", icon: "palette" },
  { id: "c5", name: "Service", icon: "volunteer-activism" },
  { id: "c6", name: "Career", icon: "work" },
  { id: "c7", name: "Tech", icon: "computer" },
  { id: "c8", name: "Music", icon: "music-note" },
  { id: "c9", name: "Outdoors", icon: "terrain" },
  { id: "c10", name: "Cultural", icon: "public" },
];

export const CLUBS: Club[] = [
  { id: "cl1", name: "BYU Developers", description: "A community for software developers and aspiring engineers. We host workshops, hackathons, and tech talks from industry professionals.", categoryId: "c7", memberCount: 245, imageColor: "#0062B8", contactEmail: "devs@byu.edu", website: "byudevs.com", instagram: "@byudevs" },
  { id: "cl2", name: "Cougar Outdoors", description: "Explore Utah's incredible wilderness with fellow Cougars. Weekly hikes, camping trips, and outdoor skills workshops.", categoryId: "c9", memberCount: 389, imageColor: "#10B981", contactEmail: "outdoors@byu.edu", website: "cougaroutdoors.byu.edu", instagram: "@cougaroutdoors" },
  { id: "cl3", name: "BYU Dance Company", description: "BYU's premier student dance organization. We perform multiple styles including contemporary, jazz, hip-hop, and ballroom.", categoryId: "c4", memberCount: 67, imageColor: "#EC4899", contactEmail: "dance@byu.edu", website: "byudance.com", instagram: "@byudance" },
  { id: "cl4", name: "Entrepreneurship Club", description: "Connect with fellow aspiring entrepreneurs. Pitch nights, mentor sessions, and startup resources for BYU innovators.", categoryId: "c6", memberCount: 178, imageColor: "#F59E0B", contactEmail: "eclub@byu.edu", website: "byuentrepreneurs.com", instagram: "@byueclub" },
  { id: "cl5", name: "Cougar Soccer Club", description: "Recreational and competitive soccer for all skill levels. Weekly pickup games, tournaments, and intramural teams.", categoryId: "c3", memberCount: 156, imageColor: "#EF4444", contactEmail: "soccer@byu.edu", website: "", instagram: "@byusoccer" },
  { id: "cl6", name: "International Students Association", description: "Celebrating diversity at BYU through cultural events, language exchanges, and community support for international students.", categoryId: "c10", memberCount: 312, imageColor: "#8B5CF6", contactEmail: "isa@byu.edu", website: "byuisa.org", instagram: "@byuisa" },
  { id: "cl7", name: "BYU Volunteer Corps", description: "Make a difference in the Provo community through organized service projects, food drives, and mentoring programs.", categoryId: "c5", memberCount: 523, imageColor: "#14B8A6", contactEmail: "volunteer@byu.edu", website: "byuvolunteer.org", instagram: "@byuvolunteer" },
  { id: "cl8", name: "Pre-Med Society", description: "Support and resources for pre-medical students. MCAT prep, shadowing opportunities, and medical school application workshops.", categoryId: "c1", memberCount: 201, imageColor: "#0EA5E9", contactEmail: "premed@byu.edu", website: "byupremed.org", instagram: "@byupremed" },
  { id: "cl9", name: "BYU Photography Club", description: "Develop your photography skills with workshops, photo walks, and exhibitions. All experience levels welcome.", categoryId: "c4", memberCount: 134, imageColor: "#6366F1", contactEmail: "photo@byu.edu", website: "", instagram: "@byuphoto" },
  { id: "cl10", name: "Cougar Board Games", description: "Weekly board game nights and tournaments. From classics to modern strategy games, come play with fellow Cougars.", categoryId: "c2", memberCount: 98, imageColor: "#D97706", contactEmail: "games@byu.edu", website: "", instagram: "@byugames" },
  { id: "cl11", name: "BYU A Cappella", description: "BYU's student a cappella groups performing pop, jazz, and show tunes. Open auditions each semester.", categoryId: "c8", memberCount: 45, imageColor: "#E11D48", contactEmail: "acappella@byu.edu", website: "byuacappella.com", instagram: "@byuacappella" },
  { id: "cl12", name: "Data Science Club", description: "Explore data science, machine learning, and AI. Kaggle competitions, industry speakers, and hands-on workshops.", categoryId: "c7", memberCount: 167, imageColor: "#7C3AED", contactEmail: "datasci@byu.edu", website: "byudatasci.com", instagram: "@byudatasci" },
];

function generateEvents(): Event[] {
  const now = new Date();
  const events: Event[] = [];

  const eventDefs: Array<{
    title: string;
    description: string;
    clubId: string;
    buildingId: string;
    categoryId: string;
    room: string;
    offsetHours: number;
    durationHours: number;
    hasLimitedCapacity: boolean;
    maxCapacity: number | null;
    hasFood: boolean;
    foodDescription: string | null;
    tags: string[];
  }> = [
    { title: "Intro to React Workshop", description: "Learn the fundamentals of React.js with hands-on exercises. Bring your laptop!", clubId: "cl1", buildingId: "b1", categoryId: "c7", room: "185", offsetHours: -0.5, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 40, hasFood: false, foodDescription: null, tags: ["workshop", "coding", "beginner"] },
    { title: "Sunset Hike at Y Mountain", description: "Join us for a scenic evening hike up Y Mountain. Meet at the trailhead. Bring water and a headlamp.", clubId: "cl2", buildingId: "b4", categoryId: "c9", room: "Lobby", offsetHours: 3, durationHours: 3, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["hiking", "outdoors", "sunset"] },
    { title: "Spring Dance Showcase", description: "Come watch our talented dancers perform contemporary and jazz pieces. Free admission.", clubId: "cl3", buildingId: "b8", categoryId: "c4", room: "Main Stage", offsetHours: 6, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 200, hasFood: false, foodDescription: null, tags: ["dance", "performance", "free"] },
    { title: "Startup Pitch Night", description: "Watch student entrepreneurs pitch their ideas to local investors and mentors.", clubId: "cl4", buildingId: "b2", categoryId: "c6", room: "Varsity Theater", offsetHours: 8, durationHours: 2.5, hasLimitedCapacity: true, maxCapacity: 100, hasFood: true, foodDescription: "Pizza and drinks provided", tags: ["entrepreneurship", "networking", "pitch"] },
    { title: "Pick-up Soccer", description: "Weekly pickup soccer game. All skill levels welcome. Just show up and play!", clubId: "cl5", buildingId: "b4", categoryId: "c3", room: "Fields", offsetHours: 24, durationHours: 2, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["soccer", "sports", "pickup"] },
    { title: "Cultural Night: Japan", description: "Experience Japanese culture through food, performances, and activities. Kimonos available for photos.", clubId: "cl6", buildingId: "b2", categoryId: "c10", room: "Ballroom", offsetHours: 28, durationHours: 3, hasLimitedCapacity: true, maxCapacity: 300, hasFood: true, foodDescription: "Japanese cuisine provided", tags: ["culture", "japan", "food", "free"] },
    { title: "Food Bank Volunteer Day", description: "Help sort and distribute food at the Utah Food Bank. Transportation provided from campus.", clubId: "cl7", buildingId: "b2", categoryId: "c5", room: "North Entrance", offsetHours: 30, durationHours: 4, hasLimitedCapacity: true, maxCapacity: 25, hasFood: false, foodDescription: null, tags: ["service", "volunteer", "food bank"] },
    { title: "MCAT Study Group", description: "Weekly MCAT study session focusing on biological sciences. Bring your prep materials.", clubId: "cl8", buildingId: "b3", categoryId: "c1", room: "Study Room 204", offsetHours: 1.5, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 15, hasFood: false, foodDescription: null, tags: ["study", "mcat", "premed"] },
    { title: "Golden Hour Photo Walk", description: "Capture beautiful golden hour photos around campus. Meet at the library fountain.", clubId: "cl9", buildingId: "b3", categoryId: "c4", room: "Front Steps", offsetHours: 5, durationHours: 1.5, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["photography", "outdoors", "creative"] },
    { title: "Board Game Tournament", description: "Monthly Settlers of Catan tournament with prizes! Registration required.", clubId: "cl10", buildingId: "b2", categoryId: "c2", room: "Room 312", offsetHours: 26, durationHours: 4, hasLimitedCapacity: true, maxCapacity: 32, hasFood: true, foodDescription: "Snacks and drinks", tags: ["games", "tournament", "prizes"] },
    { title: "A Cappella Concert", description: "End of semester a cappella concert featuring all BYU student groups.", clubId: "cl11", buildingId: "b7", categoryId: "c8", room: "Main Floor", offsetHours: 48, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 500, hasFood: false, foodDescription: null, tags: ["music", "concert", "performance"] },
    { title: "Machine Learning Workshop", description: "Hands-on introduction to neural networks using PyTorch. Laptops required.", clubId: "cl12", buildingId: "b10", categoryId: "c7", room: "Lab 102", offsetHours: 4, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 30, hasFood: false, foodDescription: null, tags: ["AI", "workshop", "coding"] },
    { title: "Hackathon Kickoff", description: "24-hour hackathon building solutions for local nonprofits. Teams of 4.", clubId: "cl1", buildingId: "b1", categoryId: "c7", room: "Atrium", offsetHours: 50, durationHours: 24, hasLimitedCapacity: true, maxCapacity: 80, hasFood: true, foodDescription: "Meals provided throughout", tags: ["hackathon", "coding", "nonprofit"] },
    { title: "Rock Climbing Social", description: "Indoor rock climbing at the Quarry. Gear provided. Perfect for beginners!", clubId: "cl2", buildingId: "b4", categoryId: "c9", room: "Quarry", offsetHours: 52, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 20, hasFood: false, foodDescription: null, tags: ["climbing", "social", "beginner"] },
    { title: "Hip Hop Workshop", description: "Open hip hop dance workshop. No experience necessary. Come learn some moves!", clubId: "cl3", buildingId: "b8", categoryId: "c4", room: "Dance Studio 2", offsetHours: 10, durationHours: 1.5, hasLimitedCapacity: true, maxCapacity: 25, hasFood: false, foodDescription: null, tags: ["dance", "hiphop", "workshop"] },
    { title: "Investor Panel", description: "Local VC investors share insights on the Utah startup ecosystem.", clubId: "cl4", buildingId: "b6", categoryId: "c6", room: "Auditorium", offsetHours: 72, durationHours: 1.5, hasLimitedCapacity: true, maxCapacity: 150, hasFood: false, foodDescription: null, tags: ["investing", "startups", "panel"] },
    { title: "Soccer Tournament", description: "Spring intramural soccer tournament. Register your team of 7.", clubId: "cl5", buildingId: "b4", categoryId: "c3", room: "South Fields", offsetHours: 76, durationHours: 6, hasLimitedCapacity: true, maxCapacity: 56, hasFood: true, foodDescription: "Hot dogs and lemonade", tags: ["soccer", "tournament", "intramural"] },
    { title: "Language Exchange Cafe", description: "Practice a new language over coffee. Native speakers from 15+ countries.", clubId: "cl6", buildingId: "b2", categoryId: "c10", room: "Cougareat", offsetHours: 2, durationHours: 2, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["language", "culture", "social"] },
    { title: "Campus Cleanup", description: "Help beautify our campus! Gloves and bags provided. Community service hours awarded.", clubId: "cl7", buildingId: "b2", categoryId: "c5", room: "Main Entrance", offsetHours: 100, durationHours: 3, hasLimitedCapacity: false, maxCapacity: null, hasFood: true, foodDescription: "Free lunch after", tags: ["service", "campus", "cleanup"] },
    { title: "Anatomy Review Session", description: "Comprehensive anatomy review led by upperclassmen. Great for midterm prep.", clubId: "cl8", buildingId: "b5", categoryId: "c1", room: "Room 101", offsetHours: 25, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 50, hasFood: false, foodDescription: null, tags: ["study", "anatomy", "review"] },
    { title: "Portrait Photography Night", description: "Learn portrait photography techniques with studio lighting. Models provided.", clubId: "cl9", buildingId: "b8", categoryId: "c4", room: "Photo Lab", offsetHours: 54, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 12, hasFood: false, foodDescription: null, tags: ["photography", "portrait", "studio"] },
    { title: "D&D One-Shot", description: "Drop-in Dungeons & Dragons one-shot adventure. No experience needed!", clubId: "cl10", buildingId: "b2", categoryId: "c2", room: "Room 310", offsetHours: 74, durationHours: 3, hasLimitedCapacity: true, maxCapacity: 8, hasFood: true, foodDescription: "Snacks provided", tags: ["games", "dnd", "rpg"] },
    { title: "Open Mic Night", description: "Share your talent! Singing, comedy, poetry, instruments - all welcome.", clubId: "cl11", buildingId: "b2", categoryId: "c8", room: "Skyroom", offsetHours: 9, durationHours: 2, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["music", "openmic", "talent"] },
    { title: "Data Viz Competition", description: "Create the most compelling visualization from a mystery dataset. Prizes awarded!", clubId: "cl12", buildingId: "b10", categoryId: "c7", room: "Lab 204", offsetHours: 96, durationHours: 3, hasLimitedCapacity: true, maxCapacity: 40, hasFood: true, foodDescription: "Boba tea provided", tags: ["data", "competition", "prizes"] },
    { title: "Git & GitHub Workshop", description: "Master version control with Git. Perfect for CS students and anyone who codes.", clubId: "cl1", buildingId: "b1", categoryId: "c7", room: "210", offsetHours: 27, durationHours: 1.5, hasLimitedCapacity: true, maxCapacity: 35, hasFood: false, foodDescription: null, tags: ["git", "workshop", "coding"] },
    { title: "Kayaking Trip", description: "Kayaking at Utah Lake! Equipment and transport provided. Must know how to swim.", clubId: "cl2", buildingId: "b4", categoryId: "c9", room: "Parking Lot", offsetHours: 120, durationHours: 5, hasLimitedCapacity: true, maxCapacity: 16, hasFood: true, foodDescription: "Packed lunches", tags: ["kayaking", "outdoors", "adventure"] },
    { title: "Ballet Master Class", description: "Guest instructor from Ballet West. Intermediate level and above.", clubId: "cl3", buildingId: "b8", categoryId: "c4", room: "Dance Studio 1", offsetHours: 55, durationHours: 1.5, hasLimitedCapacity: true, maxCapacity: 20, hasFood: false, foodDescription: null, tags: ["ballet", "dance", "masterclass"] },
    { title: "Resume Workshop", description: "Get your resume reviewed by career counselors and industry professionals.", clubId: "cl4", buildingId: "b6", categoryId: "c6", room: "Room 232", offsetHours: 32, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 30, hasFood: false, foodDescription: null, tags: ["career", "resume", "professional"] },
    { title: "3v3 Basketball", description: "Drop-in 3v3 basketball games. Come solo or bring friends!", clubId: "cl5", buildingId: "b4", categoryId: "c3", room: "Courts", offsetHours: 7, durationHours: 2, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["basketball", "sports", "pickup"] },
    { title: "Diwali Celebration", description: "Celebrate the festival of lights with traditional food, dance, and rangoli.", clubId: "cl6", buildingId: "b2", categoryId: "c10", room: "Grand Ballroom", offsetHours: 144, durationHours: 3, hasLimitedCapacity: true, maxCapacity: 250, hasFood: true, foodDescription: "Indian cuisine provided", tags: ["diwali", "culture", "food", "celebration"] },
    { title: "Homeless Shelter Visit", description: "Serve dinner at the Provo Community Shelter. Training provided.", clubId: "cl7", buildingId: "b2", categoryId: "c5", room: "South Entrance", offsetHours: 56, durationHours: 3, hasLimitedCapacity: true, maxCapacity: 15, hasFood: false, foodDescription: null, tags: ["service", "volunteer", "shelter"] },
    { title: "Med School Q&A Panel", description: "Current med students answer your questions about applications and med school life.", clubId: "cl8", buildingId: "b5", categoryId: "c1", room: "Auditorium", offsetHours: 78, durationHours: 1.5, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["premed", "panel", "advice"] },
    { title: "Film Photography Darkroom", description: "Learn to develop film in the darkroom. Film cameras available to borrow.", clubId: "cl9", buildingId: "b8", categoryId: "c4", room: "Darkroom B", offsetHours: 102, durationHours: 3, hasLimitedCapacity: true, maxCapacity: 8, hasFood: false, foodDescription: null, tags: ["photography", "film", "darkroom"] },
    { title: "Mario Kart Tournament", description: "Bring your Switch for our monthly Mario Kart tournament! Prizes for top 3.", clubId: "cl10", buildingId: "b2", categoryId: "c2", room: "Room 312", offsetHours: 11, durationHours: 3, hasLimitedCapacity: true, maxCapacity: 16, hasFood: true, foodDescription: "Chips and salsa", tags: ["games", "nintendo", "tournament"] },
    { title: "Songwriting Workshop", description: "Learn the art of songwriting from a professional songwriter. All genres.", clubId: "cl11", buildingId: "b8", categoryId: "c8", room: "Room 150", offsetHours: 80, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 20, hasFood: false, foodDescription: null, tags: ["music", "songwriting", "creative"] },
    { title: "Kaggle Competition Night", description: "Work on the latest Kaggle competition together. All levels welcome.", clubId: "cl12", buildingId: "b10", categoryId: "c7", room: "Lab 102", offsetHours: 33, durationHours: 3, hasLimitedCapacity: false, maxCapacity: null, hasFood: true, foodDescription: "Pizza rolls", tags: ["AI", "kaggle", "competition"] },
    { title: "API Design Best Practices", description: "Senior engineer from a tech company shares RESTful API design principles.", clubId: "cl1", buildingId: "b9", categoryId: "c7", room: "377", offsetHours: 53, durationHours: 1.5, hasLimitedCapacity: true, maxCapacity: 60, hasFood: false, foodDescription: null, tags: ["api", "backend", "talk"] },
    { title: "Trail Running Group", description: "5K trail run through Rock Canyon. Moderate difficulty. Bring trail shoes.", clubId: "cl2", buildingId: "b4", categoryId: "c9", room: "East Entrance", offsetHours: 29, durationHours: 1.5, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["running", "trails", "fitness"] },
    { title: "Networking Mixer", description: "Meet professionals from tech, finance, and consulting. Business casual.", clubId: "cl4", buildingId: "b6", categoryId: "c6", room: "Atrium", offsetHours: 57, durationHours: 2, hasLimitedCapacity: true, maxCapacity: 80, hasFood: true, foodDescription: "Appetizers and drinks", tags: ["networking", "career", "professional"] },
    { title: "Ultimate Frisbee", description: "Weekly ultimate frisbee game. All skill levels. Just bring a good attitude!", clubId: "cl5", buildingId: "b4", categoryId: "c3", room: "North Fields", offsetHours: 34, durationHours: 1.5, hasLimitedCapacity: false, maxCapacity: null, hasFood: false, foodDescription: null, tags: ["frisbee", "sports", "pickup"] },
  ];

  eventDefs.forEach((def, i) => {
    const start = new Date(now.getTime() + def.offsetHours * 60 * 60 * 1000);
    const end = new Date(start.getTime() + def.durationHours * 60 * 60 * 1000);
    const reservations = def.hasLimitedCapacity && def.maxCapacity
      ? Math.floor(Math.random() * def.maxCapacity * 0.7)
      : 0;

    events.push({
      id: `e${i + 1}`,
      title: def.title,
      description: def.description,
      clubId: def.clubId,
      buildingId: def.buildingId,
      categoryId: def.categoryId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      room: def.room,
      hasLimitedCapacity: def.hasLimitedCapacity,
      maxCapacity: def.maxCapacity,
      currentReservations: reservations,
      hasFood: def.hasFood,
      foodDescription: def.foodDescription,
      tags: def.tags,
      isCancelled: false,
    });
  });

  return events;
}

export const EVENTS = generateEvents();

export const DEFAULT_MEMBERSHIPS: ClubMembership[] = [
  { id: "m1", userId: "user1", clubId: "cl1", role: "admin", joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "m2", userId: "user1", clubId: "cl2", role: "member", joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "m3", userId: "user1", clubId: "cl12", role: "member", joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
];

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", clubId: "cl1", title: "Hackathon Registration Open", body: "Registration for our spring hackathon is now open! Sign up on our website before spots fill up.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "a2", clubId: "cl2", title: "New Gear Available", body: "We just got new camping gear available to borrow! Check the gear closet in the WSC.", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "a3", clubId: "cl12", title: "Competition Results", body: "Congratulations to our Kaggle team for placing 12th out of 500 teams in the latest competition!", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "a4", clubId: "cl1", title: "Meeting Location Change", body: "This week's meeting will be in TMCB 185 instead of the usual room. See you there!", createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString() },
];

export const DEFAULT_USER = {
  id: "user1",
  email: "student@byu.edu",
  name: "Alex Johnson",
  password: "password123",
  createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
};
