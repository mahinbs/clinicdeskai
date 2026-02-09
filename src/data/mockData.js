export const currentUser = {
    name: "Dr. Sarah Mitchell",
    clinic: "City Heath Clinic",
    email: "sarah.mitchell@clinic.com",
    avatar: "https://i.pravatar.cc/150?img=1"
};

export const kpiStats = [
    { label: "Total Patients", value: "1,248", change: "+12%", status: "positive" },
    { label: "Appointments Today", value: "8", change: "4 remaining", status: "neutral" },
    { label: "Revenue Today", value: "$1,450", change: "+5%", status: "positive" }
];

export const appointments = [
    { id: 1, patient: "Emma Wilson", time: "09:00 AM", type: "General Checkup", status: "Upcoming", notes: "Routine follow-up" },
    { id: 2, patient: "James Rodriguez", time: "10:30 AM", type: "Consultation", status: "Upcoming", notes: "Complaining of migraines" },
    { id: 3, patient: "Michael Chang", time: "11:15 AM", type: "Follow-up", status: "Completed", notes: "Blood pressure check" },
    { id: 4, patient: "Sophia Patel", time: "02:00 PM", type: "Vaccination", status: "Upcoming", notes: "Annual flu shot" },
    { id: 5, patient: "William Turner", time: "03:45 PM", type: "Emergency", status: "Upcoming", notes: "Acute abdominal pain" },
];

export const patients = [
    { id: 1, name: "Emma Wilson", age: 28, gender: "Female", phone: "+1 (555) 123-4567", lastVisit: "2023-10-24", condition: "Healthy" },
    { id: 2, name: "James Rodriguez", age: 45, gender: "Male", phone: "+1 (555) 987-6543", lastVisit: "2023-10-15", condition: "Hypertension" },
    { id: 3, name: "Michael Chang", age: 62, gender: "Male", phone: "+1 (555) 456-7890", lastVisit: "2023-10-26", condition: "Type 2 Diabetes" },
    { id: 4, name: "Sophia Patel", age: 34, gender: "Female", phone: "+1 (555) 234-5678", lastVisit: "2023-09-30", condition: "Asthma" },
    { id: 5, name: "William Turner", age: 50, gender: "Male", phone: "+1 (555) 876-5432", lastVisit: "2023-08-12", condition: "Arthritis" },
    { id: 6, name: "Olivia Brown", age: 22, gender: "Female", phone: "+1 (555) 345-6789", lastVisit: "2023-10-01", condition: "Migraine" },
];

export const patientHistory = [
    { id: 101, patientId: 1, date: "2023-10-24", notes: "Routine checkup. Vitals stable. No complaints.", prescription: "None" },
    { id: 102, patientId: 1, date: "2023-04-12", notes: "Patient reported mild seasonal allergies.", prescription: "Loratadine 10mg" },
    { id: 201, patientId: 2, date: "2023-10-15", notes: "Follow up on hypertension. BP 130/85.", prescription: "Lisinopril 10mg" },
];

export const revenueData = [
    { id: 1, date: "Oct 26, 2023", amount: "$150.00", patient: "Michael Chang", method: "Credit Card" },
    { id: 2, date: "Oct 26, 2023", amount: "$200.00", patient: "Emma Wilson", method: "Insurance" },
    { id: 3, date: "Oct 25, 2023", amount: "$75.00", patient: "James Rodriguez", method: "Cash" },
    { id: 4, date: "Oct 25, 2023", amount: "$300.00", patient: "Sophia Patel", method: "Credit Card" },
    { id: 5, date: "Oct 24, 2023", amount: "$120.00", patient: "William Turner", method: "Debit Card" },
];

export const clinics = [
    { id: 1, name: "City Health Clinic", location: "New York, NY", doctorCount: 12, active: true },
    { id: 2, name: "Westside Family Practice", location: "Los Angeles, CA", doctorCount: 8, active: true },
    { id: 3, name: "Oakwood Pediatrics", location: "Chicago, IL", doctorCount: 5, active: true },
    { id: 4, name: "Sunnyvale Urgent Care", location: "Sunnyvale, CA", doctorCount: 15, active: false },
    { id: 5, name: "Mountain View Cardiology", location: "Denver, CO", doctorCount: 6, active: true },
];

export const users = [
    { id: 1, name: "Dr. Sarah Mitchell", role: "Doctor", clinic: "City Health Clinic", status: "Active" },
    { id: 2, name: "John Doe", role: "Receptionist", clinic: "City Health Clinic", status: "Active" },
    { id: 3, name: "Dr. Emily Blunt", role: "Doctor", clinic: "Westside Family Practice", status: "Inactive" },
    { id: 4, name: "Alice Smith", role: "Receptionist", clinic: "Westside Family Practice", status: "Active" },
];

export const tokens = [
    { id: 1, number: "A-101", patient: "Emma Wilson", status: "In Consultation", doctor: "Dr. Sarah Mitchell", estimatedWait: "0 min" },
    { id: 2, number: "A-102", patient: "James Rodriguez", status: "Waiting", doctor: "Dr. Sarah Mitchell", estimatedWait: "15 min" },
    { id: 3, number: "B-201", patient: "Michael Chang", status: "Waiting", doctor: "Dr. Emily Blunt", estimatedWait: "30 min" },
    { id: 4, number: "A-103", patient: "Sophia Patel", status: "Completed", doctor: "Dr. Sarah Mitchell", estimatedWait: "-" },
];
