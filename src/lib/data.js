

// --------- Helpers ---------
export const uid = () => Math.random().toString(36).slice(2, 9);

// --------- Data Generation ---------

const firstNames = ["John", "Jane", "Alex", "Emily", "Chris", "Katie", "Michael", "Sarah", "David", "Laura", "Alan", "Ellie", "Ian", "Robert", "Dennis", "Tim", "Lex", "Donald", "Henry", "John", "Peter", "Susan", "Mary", "Jennifer", "Richard", "Charles", "Joseph", "Thomas", "Daniel", "Matthew"];
const lastNames = ["Smith", "Doe", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Grant", "Sattler", "Malcolm", "Muldoon", "Nedry", "Murphy", "Gennaro", "Wu", "Hammond", "Anderson", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez"];
const departments = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Business Administration", "Paleontology", "Physics", "Chemistry", "Mathematics", "Biology"];
const subjectsByDept = {
    "Computer Science": ["Intro to Programming", "Data Structures", "Algorithms", "Database Systems", "Web Development", "Operating Systems"],
    "Electrical Engineering": ["Circuit Theory", "Digital Logic", "Signals and Systems", "Electromagnetics", "Power Systems"],
    "Mechanical Engineering": ["Thermodynamics", "Fluid Mechanics", "Solid Mechanics", "Machine Design", "Heat Transfer"],
    "Civil Engineering": ["Statics", "Dynamics", "Structural Analysis", "Geotechnical Engineering", "Transportation Engineering"],
    "Business Administration": ["Principles of Management", "Marketing", "Financial Accounting", "Business Law", "Economics"],
    "Paleontology": ["Fossil Record", "Dinosaur Biology", "Paleobotany", "Taphonomy", "Vertebrate Paleontology"],
    "Physics": ["Classical Mechanics", "Quantum Mechanics", "Electrodynamics", "Thermodynamics and Statistical Mechanics", "Optics"],
    "Chemistry": ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Analytical Chemistry", "Biochemistry"],
    "Mathematics": ["Calculus", "Linear Algebra", "Differential Equations", "Abstract Algebra", "Topology"],
    "Biology": ["Cell Biology", "Genetics", "Ecology", "Evolutionary Biology", "Molecular Biology"],
};

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Generate Students (100)
export const generateStudents = (count = 100) => {
    const students = [];
    const usedNames = new Set();
    const baseEnrollment = 2403031000000;
    for (let i = 0; i < count; i++) {
        const department = getRandomElement(departments.slice(0,5)); // Focus on main engineering/biz departments
        let name;
        do {
            name = `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
        } while (usedNames.has(name));
        usedNames.add(name);

        const dob = getRandomDate(new Date(2000, 0, 1), new Date(2004, 11, 31));

        students.push({
            enrollment_number: `${baseEnrollment + i}`,
            name: name,
            email: `student${i}@example.com`,
            role: 'student',
            department: department,
            class: '',
            phone: `123-555-${String(i).padStart(4, '0')}`,
            dob: dob.toISOString().split('T')[0],
            gender: Math.random() > 0.5 ? 'Male' : 'Female',
            bloodGroup: getRandomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            aadhar: `1234 5678 ${String(i).padStart(4, '0')}`,
            program: `BTech - ${department.split(' ')[0]}`,
            admissionYear: '2024',
            tenthBoard: 'CBSE',
            tenthPercentage: `${Math.floor(Math.random() * 40) + 60}`,
            twelfthBoard: 'CBSE',
            twelfthPercentage: `${Math.floor(Math.random() * 40) + 60}`,
            permanentAddress: `${i + 1} Lorem Ipsum Lane`,
            fatherName: `Father ${lastNames[i % lastNames.length]}`,
            motherName: `Mother ${lastNames[i % lastNames.length]}`,
            fatherMobile: `987-654-${String(i).padStart(4, '0')}`,
        });
    }
    return students;
};

// Generate Staff (20)
export const generateStaff = (count = 20) => {
    const staff = [];
    const usedNames = new Set();
    for (let i = 0; i < count; i++) {
        let name;
        do {
            name = `Dr. ${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
        } while (usedNames.has(name));
        usedNames.add(name);

        const joiningDate = getRandomDate(new Date(2010, 0, 1), new Date(2022, 11, 31));
        const department = getRandomElement(departments);

        staff.push({
            staff_id: `STF-${String(i + 1).padStart(3, '0')}`,
            name: name,
            email: `staff${i}@example.com`,
            role: 'staff',
            department: department,
            joiningDate: joiningDate.toISOString().split('T')[0],
            qualification: 'Ph.D.',
            designation: i % 5 === 0 ? 'Head of Department' : 'Professor',
            phone: `555-123-${String(i).padStart(4, '0')}`,
            address: `${i+1} Staff Quarters`,
            gender: Math.random() > 0.5 ? 'Male' : 'Female',
            dob: getRandomDate(new Date(1970, 0, 1), new Date(1990, 11, 31)).toISOString().split('T')[0],
            city: 'Springfield',
            state: 'Illinois',
            pincode: '62704',
            assigned_classes: [],
        });
    }
    return staff;
};

// Generate Admin (1)
export const generateAdmin = () => {
    return {
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
    };
};

// Generate Classes
export const generateClasses = (students, staff, count = 10) => {
    const classes = [];
    // Ensure we have enough students to distribute
    if (students.length < count * 10) {
        console.error("Not enough students to create the specified number of classes.");
        return [];
    }

    for (let i = 0; i < count; i++) {
        const department = getRandomElement(departments.slice(0, 5)); // Stick to the main departments
        const assignedStaff = staff.filter(s => s.department === department);
        if (assignedStaff.length === 0) continue; // Skip if no staff for this dept

        // Assign 5 subjects, each taught by a relevant staff member
        const staffForClass = [...new Set(Array.from({ length: 5 }, () => getRandomElement(assignedStaff)))];
        const subjectsForClass = [...new Set(Array.from({ length: 5 }, () => getRandomElement(subjectsByDept[department])))]
            .map((subj, index) => ({
                subjectName: subj,
                staffId: staffForClass[index % staffForClass.length].staff_id,
            }));

        // Assign 10 unique students to each class
        const classStudents = students
            .slice(i * 10, (i * 10) + 10)
            .map(s => s.enrollment_number);
        
        const classId = `${department.slice(0,2).toUpperCase()}-${String(i+101)}`;

        const newClass = {
            class_id: classId,
            class_name: `${department} - Section ${String.fromCharCode(65 + i)}`,
            department: department,
            semester: ((i % 2) + 1), // Sem 1 or 2
            capacity: 60,
            room_number: `R-${String(i+301)}`,
            subjects: subjectsForClass,
            staff: [...new Set(subjectsForClass.map(s => s.staffId))],
            students: classStudents
        };
        classes.push(newClass);
        
        // Update staff with their assigned classes
        newClass.staff.forEach(staffId => {
            const staffToUpdate = staff.find(s => s.staff_id === staffId);
             if(staffToUpdate && !staffToUpdate.assigned_classes.includes(newClass.class_id)){
                staffToUpdate.assigned_classes.push(newClass.class_id);
            }
        });

        // Update students with their assigned class ID
        classStudents.forEach(studentId => {
            const studentToUpdate = students.find(s => s.enrollment_number === studentId);
            if (studentToUpdate) {
                studentToUpdate.class = classId;
            }
        });
    }
    return classes;
};

// --- Seeded Data ---
// This data is used by the `seedDatabase` action to populate Firestore.

export const seedStudents = generateStudents(100);
export const seedStaff = generateStaff(20);
export const seedAdmin = generateAdmin();
export const seedClasses = generateClasses(seedStudents, seedStaff, 10);

// Combine all users for auth simulation during login
const allUsersForAuth = [...seedStudents, ...seedStaff, seedAdmin];

export const getUserByEmail = (email) => {
    return allUsersForAuth.find(user => user.email === email);
}
