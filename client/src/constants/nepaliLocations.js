// Comprehensive list of Nepali Districts and Major Cities
export const NEPALI_DISTRICTS = [
    "Achham", "Arghakhanchi", "Baglung", "Baitadi", "Bajhang", "Bajura", "Banke", "Bara", "Bardiya", "Bhaktapur",
    "Bhojpur", "Chitwan", "Dadeldhura", "Dailekh", "Dang", "Darchula", "Dhading", "Dhankuta", "Dhanusha", "Dolakha",
    "Dolpa", "Doti", "Gorkha", "Gulmi", "Humla", "Ilam", "Jajarkot", "Jhapa", "Jumla", "Kailali", "Kalikot",
    "Kanchanpur", "Kapilvastu", "Kaski", "Kathmandu", "Kavrepalanchok", "Khotang", "Lalitpur", "Lamjung", "Mahottari",
    "Makwanpur", "Manang", "Morang", "Mugu", "Mustang", "Myagdi", "Nawalparasi", "Nuwakot", "Okhaldhunga", "Palpa",
    "Panchthar", "Parbat", "Parsa", "Pyuthan", "Ramechhap", "Rasuwa", "Rautahat", "Rolpa", "Rukum", "Rupandehi",
    "Salyan", "Sankhuwasabha", "Saptari", "Sarlahi", "Sindhuli", "Sindhupalchok", "Siraha", "Solukhumbu", "Sunsari",
    "Surkhet", "Syangja", "Tanahu", "Taplejung", "Terhathum", "Udayapur"
];

export const MAJOR_CITIES = [
    "Kathmandu", "Pokhara", "Lalitpur", "Biratnagar", "Bharatpur", "Birgunj", "Butwal", "Dharan", "Bhimdatta", "Dhangadhi",
    "Janakpur", "Hetauda", "Itahari", "Nepalgunj", "Siddharthanagar", "Ghorahi", "Tulsipur", "Kirtipur", "Bhaktapur"
];

// Combined list for dropdowns (Districts first, then major cities if not covered, but usually District is better for admin assignment)
// For this app, we will use Districts as the primary logical unit for Admin assignment.
export const LOCATIONS = NEPALI_DISTRICTS;
