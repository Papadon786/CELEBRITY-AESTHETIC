// Static fallback identity used anywhere the DB-backed ClinicSettings row
// hasn't loaded yet (e.g. synchronous contexts). The CRM's Website Content
// settings page is the source of truth — see `getClinicSettings()`.
export const CLINIC_INFO = {
  name: "Crown Celebrity Aesthetic",
  tagline: "Hair & Skin Clinic · PMU Services & Academy",
  address: "The Celebrity Aesthetics, Hair PRP, Permanent Makeup - Satyam Hair Transplant Centre, Bangalore - 560078, Karnataka, India",
  landmark: "Near Satyam Hair Transplant Centre, Bangalore",
  phone: "+91 9591047171",
  phoneDisplay: "9591047171",
  email: "celebrityaestheticcrown@gmail.com",
  website: "https://crown-celebrity-aesthetic.com",
  mapsUrl: "https://maps.app.goo.gl/wHwR9bCYLRUu5Vm86",
  coordinates: {
    lat: 12.9174467,
    lng: 77.5931932,
  },
}
