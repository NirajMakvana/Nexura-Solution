import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Models
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payslip from '../models/Payslip.js';
import Blog from '../models/Blog.js';
import Review from '../models/Review.js';
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import Contact from '../models/Contact.js';
import Subscriber from '../models/Subscriber.js';
import Counter from '../models/Counter.js';
import Invoice from '../models/Invoice.js';

dotenv.config();

const clearAndSeedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexura-solution');
        console.log('✅ Connected to MongoDB');

        // ─── 1. CLEAR DATABASE ───────────────────────────────────────────────
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}), Employee.deleteMany({}), Client.deleteMany({}),
            Project.deleteMany({}), Task.deleteMany({}), Attendance.deleteMany({}),
            Leave.deleteMany({}), Payslip.deleteMany({}), Blog.deleteMany({}),
            Review.deleteMany({}), Job.deleteMany({}), JobApplication.deleteMany({}),
            Contact.deleteMany({}), Subscriber.deleteMany({}), Counter.deleteMany({}),
            Invoice.deleteMany({})
        ]);
        console.log('✅ Database cleared.');

        // ─── 2. USERS & EMPLOYEES ────────────────────────────────────────────
        console.log('🌱 Seeding Users & Employees...');

        const usersData = [
            {
                firstName: 'Admin', lastName: 'Nexura',
                email: 'admin@nexura.com', role: 'admin',
                department: 'Management', position: 'Administrator',
                password: 'password123', phone: '+91 98765 00001',
                joinDate: new Date('2022-01-01'),
                bio: 'Managing Nexura operations and growth strategy.',
                address: { city: 'Ahmedabad', state: 'Gujarat', country: 'India' }
            },
            {
                firstName: 'Priya', lastName: 'Sharma',
                email: 'hr@nexura.com', role: 'hr',
                department: 'Human Resources', position: 'HR Manager',
                password: 'password123', phone: '+91 98765 00002',
                joinDate: new Date('2022-03-15'),
                bio: 'Passionate about building great teams and culture.',
                address: { city: 'Ahmedabad', state: 'Gujarat', country: 'India' }
            },
            {
                firstName: 'Rahul', lastName: 'Mehta',
                email: 'pm@nexura.com', role: 'manager',
                department: 'Development', position: 'Project Manager',
                password: 'password123', phone: '+91 98765 00003',
                joinDate: new Date('2022-06-01'),
                bio: 'Delivering projects on time with quality.',
                address: { city: 'Surat', state: 'Gujarat', country: 'India' }
            },
            {
                firstName: 'Arjun', lastName: 'Patel',
                email: 'lead@nexura.com', role: 'employee',
                department: 'Development', position: 'Team Lead',
                password: 'password123', phone: '+91 98765 00004',
                joinDate: new Date('2022-09-01'),
                bio: 'Full-stack developer with 6+ years experience.',
                address: { city: 'Vadodara', state: 'Gujarat', country: 'India' }
            },
            {
                firstName: 'Sneha', lastName: 'Joshi',
                email: 'dev@nexura.com', role: 'employee',
                department: 'Development', position: 'Frontend Developer',
                password: 'password123', phone: '+91 98765 00005',
                joinDate: new Date('2023-01-10'),
                bio: 'React specialist who loves clean UI.',
                address: { city: 'Ahmedabad', state: 'Gujarat', country: 'India' }
            },
            {
                firstName: 'Karan', lastName: 'Desai',
                email: 'design@nexura.com', role: 'employee',
                department: 'Design', position: 'UI/UX Designer',
                password: 'password123', phone: '+91 98765 00006',
                joinDate: new Date('2023-03-20'),
                bio: 'Crafting beautiful and intuitive user experiences.',
                address: { city: 'Rajkot', state: 'Gujarat', country: 'India' }
            }
        ];

        const users = [];
        const employees = [];

        const salaryMap = {
            admin:    { basic: 80000, hra: 20000, allowances: 10000, deductions: 5000 },
            hr:       { basic: 60000, hra: 15000, allowances: 8000,  deductions: 4000 },
            manager:  { basic: 70000, hra: 17500, allowances: 9000,  deductions: 4500 },
            teamlead: { basic: 65000, hra: 16000, allowances: 8500,  deductions: 4200 },
            frontend: { basic: 50000, hra: 12500, allowances: 6000,  deductions: 3000 },
            designer: { basic: 48000, hra: 12000, allowances: 5500,  deductions: 2800 },
        };

        const skillsMap = {
            admin:    ['Leadership', 'Strategy', 'Communication', 'Finance'],
            hr:       ['Recruitment', 'Employee Relations', 'Payroll', 'Training'],
            manager:  ['Agile', 'Scrum', 'JIRA', 'Risk Management', 'Communication'],
            teamlead: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS'],
            frontend: ['React', 'Tailwind CSS', 'JavaScript', 'Figma', 'Vite'],
            designer: ['Figma', 'Adobe XD', 'Illustrator', 'Prototyping', 'Branding'],
        };

        const salaryKeys = ['admin', 'hr', 'manager', 'teamlead', 'frontend', 'designer'];

        for (let i = 0; i < usersData.length; i++) {
            const data = usersData[i];
            const user = await User.create(data);
            users.push(user);

            const sal = salaryMap[salaryKeys[i]];
            const emp = await Employee.create({
                user: user._id,
                employeeId: user.employeeId,
                department: data.department,
                designation: data.position,
                joiningDate: data.joinDate,
                salary: sal,
                skills: skillsMap[salaryKeys[i]],
                status: 'Active'
            });
            employees.push(emp);
        }

        const [admin, hr, pm, lead, dev, designer] = users;
        console.log('✅ Users & Employees created.');

        // ─── 3. CLIENTS ──────────────────────────────────────────────────────
        console.log('🌱 Seeding Clients...');
        const clients = await Client.insertMany([
            {
                name: 'Vikram Nair', company: 'TechCorp Solutions',
                email: 'vikram@techcorp.com', phone: '+91 99001 11001',
                website: 'https://techcorp.com',
                address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
                status: 'Active', notes: 'Long-term client, prefers weekly updates.'
            },
            {
                name: 'Sarah Mitchell', company: 'DesignStudio UK',
                email: 'sarah@designstudio.co.uk', phone: '+44 7700 900001',
                website: 'https://designstudio.co.uk',
                address: { city: 'London', state: 'England', country: 'UK' },
                status: 'Active', notes: 'Requires Figma deliverables.'
            },
            {
                name: 'Amit Shah', company: 'RetailHub India',
                email: 'amit@retailhub.in', phone: '+91 98001 22002',
                website: 'https://retailhub.in',
                address: { city: 'Delhi', state: 'Delhi', country: 'India' },
                status: 'Active', notes: 'E-commerce focused, tight deadlines.'
            },
            {
                name: 'James Carter', company: 'FinEdge Corp',
                email: 'james@finedge.com', phone: '+1 415 555 0101',
                website: 'https://finedge.com',
                address: { city: 'San Francisco', state: 'California', country: 'USA' },
                status: 'Active', notes: 'Fintech client, high security requirements.'
            },
            {
                name: 'Meera Iyer', company: 'EduLearn Platform',
                email: 'meera@edulearn.io', phone: '+91 97001 33003',
                website: 'https://edulearn.io',
                address: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
                status: 'Prospect', notes: 'Interested in LMS development.'
            }
        ]);
        console.log('✅ Clients created.');

        // ─── 4. PROJECTS ─────────────────────────────────────────────────────
        console.log('� Seeding Projects...');
        const projects = await Project.insertMany([
            {
                name: 'TechCorp Corporate Website',
                description: 'Complete redesign and development of TechCorp corporate website with CMS integration.',
                client: clients[0]._id, category: 'Web Development',
                team: [{ employee: lead._id, role: 'Tech Lead' }, { employee: dev._id, role: 'Developer' }, { employee: designer._id, role: 'Designer' }],
                startDate: new Date('2025-01-05'), endDate: new Date('2025-02-28'),
                budget: 120000, status: 'Completed', priority: 'High', progress: 100,
                technologies: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
                milestones: [
                    { title: 'Design Approval', dueDate: new Date('2025-01-15'), completed: true },
                    { title: 'Frontend Complete', dueDate: new Date('2025-02-10'), completed: true },
                    { title: 'Go Live', dueDate: new Date('2025-02-28'), completed: true }
                ]
            },
            {
                name: 'DesignStudio Mobile App UI',
                description: 'UI/UX design and frontend for a creative portfolio mobile app.',
                client: clients[1]._id, category: 'UI/UX Design',
                team: [{ employee: designer._id, role: 'Lead Designer' }, { employee: dev._id, role: 'Frontend Dev' }],
                startDate: new Date('2025-02-01'), endDate: new Date('2025-05-31'),
                budget: 85000, status: 'In Progress', priority: 'High', progress: 60,
                technologies: ['Figma', 'React Native', 'Expo'],
                milestones: [
                    { title: 'Wireframes', dueDate: new Date('2025-02-15'), completed: true },
                    { title: 'High Fidelity Designs', dueDate: new Date('2025-03-15'), completed: true },
                    { title: 'Frontend Implementation', dueDate: new Date('2025-05-01'), completed: false }
                ]
            },
            {
                name: 'RetailHub E-Commerce Platform',
                description: 'Full-stack e-commerce platform with inventory, payments, and admin dashboard.',
                client: clients[2]._id, category: 'Web Development',
                team: [{ employee: pm._id, role: 'Manager' }, { employee: lead._id, role: 'Backend Dev' }, { employee: dev._id, role: 'Frontend Dev' }],
                startDate: new Date('2025-03-01'), endDate: new Date('2025-07-31'),
                budget: 250000, status: 'In Progress', priority: 'High', progress: 30,
                technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis'],
                milestones: [
                    { title: 'Architecture Design', dueDate: new Date('2025-03-15'), completed: true },
                    { title: 'Auth & Product Module', dueDate: new Date('2025-04-30'), completed: false },
                    { title: 'Payment Integration', dueDate: new Date('2025-06-15'), completed: false }
                ]
            },
            {
                name: 'FinEdge Dashboard',
                description: 'Analytics and reporting dashboard for fintech operations.',
                client: clients[3]._id, category: 'Web Development',
                team: [{ employee: lead._id, role: 'Full Stack Dev' }, { employee: designer._id, role: 'UI Designer' }],
                startDate: new Date('2025-04-01'), endDate: new Date('2025-06-30'),
                budget: 180000, status: 'Planning', priority: 'High', progress: 5,
                technologies: ['React', 'D3.js', 'Node.js', 'PostgreSQL'],
                milestones: [
                    { title: 'Requirements Gathering', dueDate: new Date('2025-04-10'), completed: true },
                    { title: 'Prototype', dueDate: new Date('2025-05-01'), completed: false }
                ]
            },
            {
                name: 'EduLearn LMS',
                description: 'Learning Management System with video courses, quizzes, and certificates.',
                client: clients[4]._id, category: 'Web Development',
                team: [{ employee: pm._id, role: 'Manager' }, { employee: dev._id, role: 'Developer' }],
                startDate: new Date('2025-05-01'), endDate: new Date('2025-09-30'),
                budget: 320000, status: 'Planning', priority: 'Medium', progress: 0,
                technologies: ['React', 'Node.js', 'MongoDB', 'AWS S3', 'FFmpeg'],
                milestones: [
                    { title: 'Scope Finalization', dueDate: new Date('2025-05-15'), completed: false }
                ]
            }
        ]);
        console.log('✅ Projects created.');

        // ─── 5. TASKS ────────────────────────────────────────────────────────
        console.log('🌱 Seeding Tasks...');
        await Task.insertMany([
            // Project 1 - Completed
            { title: 'Setup Project Repository', description: 'Initialize Git repo and CI/CD pipeline', project: projects[0]._id, assignedTo: lead._id, assignedBy: pm._id, priority: 'High', status: 'Completed', dueDate: new Date('2025-01-07'), completedDate: new Date('2025-01-07'), tags: ['setup', 'devops'] },
            { title: 'Create Figma Wireframes', description: 'Low-fi wireframes for all pages', project: projects[0]._id, assignedTo: designer._id, assignedBy: pm._id, priority: 'High', status: 'Completed', dueDate: new Date('2025-01-12'), completedDate: new Date('2025-01-11'), tags: ['design'] },
            { title: 'Build Homepage', description: 'Responsive homepage with hero, services, testimonials', project: projects[0]._id, assignedTo: dev._id, assignedBy: lead._id, priority: 'High', status: 'Completed', dueDate: new Date('2025-02-01'), completedDate: new Date('2025-01-30'), tags: ['frontend'] },
            { title: 'Backend API Development', description: 'REST APIs for CMS content', project: projects[0]._id, assignedTo: lead._id, assignedBy: pm._id, priority: 'High', status: 'Completed', dueDate: new Date('2025-02-10'), completedDate: new Date('2025-02-08'), tags: ['backend'] },
            // Project 2 - In Progress
            { title: 'User Research & Personas', description: 'Interview 10 users and create personas', project: projects[1]._id, assignedTo: designer._id, assignedBy: pm._id, priority: 'High', status: 'Completed', dueDate: new Date('2025-02-10'), completedDate: new Date('2025-02-09'), tags: ['research', 'ux'] },
            { title: 'App Wireframes', description: 'All screens wireframed in Figma', project: projects[1]._id, assignedTo: designer._id, assignedBy: pm._id, priority: 'High', status: 'Completed', dueDate: new Date('2025-02-20'), completedDate: new Date('2025-02-18'), tags: ['design'] },
            { title: 'High Fidelity UI Screens', description: 'Pixel-perfect designs for all 20 screens', project: projects[1]._id, assignedTo: designer._id, assignedBy: pm._id, priority: 'High', status: 'In Progress', dueDate: new Date('2025-04-01'), tags: ['design', 'ui'] },
            { title: 'React Native Setup', description: 'Expo project setup with navigation', project: projects[1]._id, assignedTo: dev._id, assignedBy: lead._id, priority: 'Medium', status: 'In Progress', dueDate: new Date('2025-04-15'), tags: ['mobile', 'frontend'] },
            // Project 3 - In Progress
            { title: 'Database Schema Design', description: 'Design PostgreSQL schema for e-commerce', project: projects[2]._id, assignedTo: lead._id, assignedBy: pm._id, priority: 'High', status: 'Completed', dueDate: new Date('2025-03-10'), completedDate: new Date('2025-03-09'), tags: ['database'] },
            { title: 'Authentication Module', description: 'JWT auth with refresh tokens', project: projects[2]._id, assignedTo: lead._id, assignedBy: pm._id, priority: 'High', status: 'In Progress', dueDate: new Date('2025-04-20'), tags: ['backend', 'security'] },
            { title: 'Product Listing Page', description: 'Filterable product grid with search', project: projects[2]._id, assignedTo: dev._id, assignedBy: lead._id, priority: 'High', status: 'To Do', dueDate: new Date('2025-05-01'), tags: ['frontend'] },
            { title: 'Shopping Cart & Checkout', description: 'Cart state management and checkout flow', project: projects[2]._id, assignedTo: dev._id, assignedBy: lead._id, priority: 'High', status: 'To Do', dueDate: new Date('2025-05-20'), tags: ['frontend'] },
            { title: 'Stripe Payment Integration', description: 'Integrate Stripe for card payments', project: projects[2]._id, assignedTo: lead._id, assignedBy: pm._id, priority: 'High', status: 'To Do', dueDate: new Date('2025-06-10'), tags: ['backend', 'payments'] },
            // Project 4 - Planning
            { title: 'Dashboard Prototype', description: 'Interactive Figma prototype for client review', project: projects[3]._id, assignedTo: designer._id, assignedBy: pm._id, priority: 'High', status: 'In Review', dueDate: new Date('2025-04-25'), tags: ['design', 'prototype'] },
            { title: 'D3.js Chart Components', description: 'Reusable chart library for analytics', project: projects[3]._id, assignedTo: lead._id, assignedBy: pm._id, priority: 'Medium', status: 'To Do', dueDate: new Date('2025-05-15'), tags: ['frontend', 'charts'] }
        ]);
        console.log('✅ Tasks created.');

        // ─── 6. ATTENDANCE (last 30 working days) ────────────────────────────
        console.log('🌱 Seeding Attendance...');
        const attendanceEmployees = [lead, dev, designer];
        const attendanceRecords = [];

        for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
            const d = new Date();
            d.setDate(d.getDate() - daysAgo);
            const dayOfWeek = d.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

            for (const emp of attendanceEmployees) {
                const rand = Math.random();
                let status = 'Present';
                let clockIn = null, clockOut = null, totalHours = 0;

                if (rand < 0.85) {
                    status = 'Present';
                    const inHour = 9 + (Math.random() < 0.3 ? 0 : Math.random() < 0.5 ? 0 : 1);
                    const inMin = Math.floor(Math.random() * 30);
                    clockIn = new Date(d); clockIn.setHours(inHour, inMin, 0, 0);
                    clockOut = new Date(d); clockOut.setHours(18, Math.floor(Math.random() * 30), 0, 0);
                    totalHours = parseFloat(((clockOut - clockIn) / 3600000).toFixed(1));
                    if (inHour >= 10) status = 'Late';
                } else if (rand < 0.92) {
                    status = 'Half Day';
                    clockIn = new Date(d); clockIn.setHours(9, 0, 0, 0);
                    clockOut = new Date(d); clockOut.setHours(13, 0, 0, 0);
                    totalHours = 4;
                } else {
                    status = 'Absent';
                }

                attendanceRecords.push({
                    employee: emp._id,
                    date: new Date(d),
                    clockIn, clockOut, totalHours, status,
                    location: emp._id.equals(dev._id) ? 'Remote' : 'Office'
                });
            }
        }
        await Attendance.insertMany(attendanceRecords);
        console.log(`✅ Attendance created (${attendanceRecords.length} records).`);

        // ─── 7. LEAVES ───────────────────────────────────────────────────────
        console.log('🌱 Seeding Leaves...');
        await Leave.insertMany([
            { employee: dev._id, type: 'Sick Leave', startDate: new Date('2025-02-10'), endDate: new Date('2025-02-11'), days: 2, reason: 'Viral fever and cold', status: 'Approved', approvedBy: hr._id, approvedDate: new Date('2025-02-09') },
            { employee: designer._id, type: 'Casual Leave', startDate: new Date('2025-02-20'), endDate: new Date('2025-02-21'), days: 2, reason: 'Family function', status: 'Approved', approvedBy: hr._id, approvedDate: new Date('2025-02-18') },
            { employee: lead._id, type: 'Annual Leave', startDate: new Date('2025-03-10'), endDate: new Date('2025-03-14'), days: 5, reason: 'Vacation trip', status: 'Approved', approvedBy: hr._id, approvedDate: new Date('2025-03-05') },
            { employee: dev._id, type: 'Casual Leave', startDate: new Date('2025-04-05'), endDate: new Date('2025-04-05'), days: 1, reason: 'Personal work', status: 'Pending' },
            { employee: designer._id, type: 'Emergency Leave', startDate: new Date('2025-04-12'), endDate: new Date('2025-04-13'), days: 2, reason: 'Medical emergency in family', status: 'Approved', approvedBy: hr._id, approvedDate: new Date('2025-04-12') },
            { employee: lead._id, type: 'Sick Leave', startDate: new Date('2025-05-02'), endDate: new Date('2025-05-02'), days: 1, reason: 'Migraine', status: 'Rejected', approvedBy: hr._id, rejectionReason: 'Critical project deadline' }
        ]);
        console.log('✅ Leaves created.');

        // ─── 8. PAYSLIPS ─────────────────────────────────────────────────────
        console.log('🌱 Seeding Payslips...');
        const months = ['October', 'November', 'December', 'January', 'February', 'March'];
        const monthDates = [
            { m: 'October',  y: 2024, paid: new Date('2024-10-31') },
            { m: 'November', y: 2024, paid: new Date('2024-11-30') },
            { m: 'December', y: 2024, paid: new Date('2024-12-31') },
            { m: 'January',  y: 2025, paid: new Date('2025-01-31') },
            { m: 'February', y: 2025, paid: new Date('2025-02-28') },
            { m: 'March',    y: 2025, paid: new Date('2025-03-31') },
        ];

        const payslipEmployees = [
            { user: lead,     sal: salaryMap.teamlead },
            { user: dev,      sal: salaryMap.frontend },
            { user: designer, sal: salaryMap.designer },
        ];

        const payslipDocs = [];
        for (const { user: emp, sal } of payslipEmployees) {
            for (let i = 0; i < monthDates.length; i++) {
                const { m, y, paid } = monthDates[i];
                const isLast = i === monthDates.length - 1;
                payslipDocs.push({
                    employee: emp._id,
                    month: m, year: y,
                    basicSalary: sal.basic,
                    hra: sal.hra,
                    allowances: sal.allowances,
                    deductions: sal.deductions,
                    netSalary: sal.basic + sal.hra + sal.allowances - sal.deductions,
                    status: isLast ? 'Processing' : 'Paid',
                    paymentDate: isLast ? null : paid
                });
            }
        }
        await Payslip.insertMany(payslipDocs);
        console.log(`✅ Payslips created (${payslipDocs.length} records).`);

        // ─── 9. INVOICES ─────────────────────────────────────────────────────
        console.log('🌱 Seeding Invoices...');
        await Invoice.insertMany([
            {
                invoiceNumber: 'INV-2501-0001',
                client: clients[0]._id, project: projects[0]._id,
                issueDate: new Date('2025-01-31'), dueDate: new Date('2025-02-15'),
                items: [
                    { description: 'Website Design & Development', quantity: 1, rate: 100000, amount: 100000 },
                    { description: 'CMS Integration', quantity: 1, rate: 20000, amount: 20000 }
                ],
                subtotal: 120000, taxPercentage: 18, tax: 21600, discount: 5000, total: 136600,
                status: 'paid', paidDate: new Date('2025-02-10'),
                notes: 'Thank you for your business!',
                terms: 'Payment due within 15 days.'
            },
            {
                invoiceNumber: 'INV-2502-0002',
                client: clients[1]._id, project: projects[1]._id,
                issueDate: new Date('2025-03-01'), dueDate: new Date('2025-03-20'),
                items: [
                    { description: 'UI/UX Design - Phase 1 (Wireframes + Research)', quantity: 1, rate: 40000, amount: 40000 }
                ],
                subtotal: 40000, taxPercentage: 18, tax: 7200, discount: 0, total: 47200,
                status: 'paid', paidDate: new Date('2025-03-18'),
                notes: 'Phase 1 milestone payment.',
                terms: 'Net 20 days.'
            },
            {
                invoiceNumber: 'INV-2503-0003',
                client: clients[1]._id, project: projects[1]._id,
                issueDate: new Date('2025-04-01'), dueDate: new Date('2025-04-20'),
                items: [
                    { description: 'UI/UX Design - Phase 2 (High Fidelity Screens)', quantity: 1, rate: 45000, amount: 45000 }
                ],
                subtotal: 45000, taxPercentage: 18, tax: 8100, discount: 0, total: 53100,
                status: 'sent',
                notes: 'Phase 2 milestone payment.',
                terms: 'Net 20 days.'
            },
            {
                invoiceNumber: 'INV-2503-0004',
                client: clients[2]._id, project: projects[2]._id,
                issueDate: new Date('2025-03-31'), dueDate: new Date('2025-04-15'),
                items: [
                    { description: 'E-Commerce Platform - Milestone 1 (Architecture + Auth)', quantity: 1, rate: 75000, amount: 75000 }
                ],
                subtotal: 75000, taxPercentage: 18, tax: 13500, discount: 0, total: 88500,
                status: 'overdue',
                notes: 'Milestone 1 payment overdue.',
                terms: 'Net 15 days.'
            },
            {
                invoiceNumber: 'INV-2504-0005',
                client: clients[3]._id, project: projects[3]._id,
                issueDate: new Date('2025-04-15'), dueDate: new Date('2025-05-05'),
                items: [
                    { description: 'FinEdge Dashboard - Discovery & Prototype', quantity: 1, rate: 30000, amount: 30000 }
                ],
                subtotal: 30000, taxPercentage: 18, tax: 5400, discount: 0, total: 35400,
                status: 'draft',
                notes: 'Discovery phase invoice.',
                terms: 'Net 20 days.'
            }
        ]);
        console.log('✅ Invoices created.');

        // ─── 10. BLOGS ───────────────────────────────────────────────────────
        console.log('🌱 Seeding Blogs...');
        const blogsData = [
            {
                title: 'The Future of Web Development in 2025',
                excerpt: 'From AI-assisted coding to edge computing — here are the trends reshaping how we build for the web.',
                content: `<p>Web development is evolving faster than ever. In 2025, developers are embracing AI pair-programming tools, edge-first architectures, and component-driven design systems.</p><p>React Server Components, Astro, and Bun are changing the performance game. Meanwhile, WebAssembly is enabling near-native performance in the browser.</p><p>At Nexura, we stay ahead of these trends to deliver cutting-edge solutions to our clients.</p>`,
                category: 'technology', author: 'Rahul Mehta', authorRole: 'Project Manager',
                status: 'published', featured: true, views: 342, readTime: '5 min read',
                tags: ['React', 'Web Dev', 'Trends', '2025']
            },
            {
                title: 'Why UI/UX Design is the Heart of Every Product',
                excerpt: 'Great design is not just about aesthetics — it\'s about solving real user problems with empathy and clarity.',
                content: `<p>In today's competitive market, users have zero tolerance for confusing interfaces. A product that looks good but feels broken will lose users within seconds.</p><p>At Nexura, our design process starts with user research, moves through wireframing, and ends with pixel-perfect high-fidelity prototypes tested with real users.</p><p>Design thinking is not a phase — it's a mindset we apply throughout the entire development lifecycle.</p>`,
                category: 'ui-ux-design', author: 'Karan Desai', authorRole: 'UI/UX Designer',
                status: 'published', featured: true, views: 218, readTime: '4 min read',
                tags: ['UI/UX', 'Design', 'User Research', 'Figma']
            },
            {
                title: 'How We Built a 100-Score Lighthouse App',
                excerpt: 'Performance, accessibility, SEO — achieving a perfect Lighthouse score requires discipline and the right tools.',
                content: `<p>Getting a perfect 100 on Google Lighthouse is a badge of honor for any web team. Here's how we achieved it on a recent client project.</p><p>Key strategies: lazy loading images, code splitting with Vite, semantic HTML, proper ARIA labels, and a CDN-backed asset pipeline.</p><p>The result? Sub-2-second load times and a 40% increase in organic traffic for our client.</p>`,
                category: 'web-development', author: 'Arjun Patel', authorRole: 'Team Lead',
                status: 'published', featured: false, views: 156, readTime: '6 min read',
                tags: ['Performance', 'Lighthouse', 'SEO', 'Vite']
            },
            {
                title: 'Nexura Team Retreat 2025 — Recharging Together',
                excerpt: 'Our annual team retreat was a perfect blend of fun, bonding, and strategic planning for the year ahead.',
                content: `<p>This year's Nexura retreat took us to the beautiful hills of Saputara. Two days of team activities, brainstorming sessions, and a lot of laughter.</p><p>We aligned on our 2025 goals, celebrated team wins, and welcomed our newest members. The energy we brought back to the office was electric.</p><p>A strong team is the foundation of great work — and we're proud of ours.</p>`,
                category: 'company-news', author: 'Priya Sharma', authorRole: 'HR Manager',
                status: 'published', featured: false, views: 89, readTime: '3 min read',
                tags: ['Team', 'Culture', 'Retreat', 'Nexura']
            },
            {
                title: 'Getting Started with React Server Components',
                excerpt: 'RSC changes how we think about data fetching and rendering. Here\'s a practical guide to get you started.',
                content: `<p>React Server Components (RSC) allow you to render components on the server without sending JavaScript to the client. This is a paradigm shift.</p><p>With RSC, you can fetch data directly in your component without useEffect or API routes. The result is faster initial loads and smaller bundle sizes.</p><p>This post walks through a practical example of migrating a data-heavy dashboard to RSC.</p>`,
                category: 'web-development', author: 'Sneha Joshi', authorRole: 'Frontend Developer',
                status: 'published', featured: false, views: 127, readTime: '7 min read',
                tags: ['React', 'RSC', 'Next.js', 'Performance']
            },
            {
                title: 'Brand Identity Design: More Than Just a Logo',
                excerpt: 'A strong brand identity tells your story before you say a word. Here\'s what goes into building one.',
                content: `<p>Brand identity is the visual language of your business — colors, typography, iconography, and tone of voice all working together.</p><p>At Nexura, our branding projects start with a discovery workshop to understand the client's values, audience, and competition.</p><p>From there, we craft a brand guide that ensures consistency across every touchpoint.</p>`,
                category: 'graphics-design', author: 'Karan Desai', authorRole: 'UI/UX Designer',
                status: 'draft', featured: false, views: 0, readTime: '5 min read',
                tags: ['Branding', 'Design', 'Identity', 'Logo']
            }
        ];

        for (const b of blogsData) {
            await Blog.create(b);
        }
        console.log('✅ Blogs created.');

        // ─── 11. REVIEWS ─────────────────────────────────────────────────────
        console.log('🌱 Seeding Reviews...');
        await Review.insertMany([
            { name: 'Vikram Nair', company: 'TechCorp Solutions', email: 'vikram@techcorp.com', rating: 5, content: 'Nexura delivered our website on time and beyond expectations. The team was professional, responsive, and truly understood our vision. Highly recommended!', service: 'Web Development', status: 'Approved', isPublished: true, featured: true, publishedDate: new Date('2025-03-05'), reviewedBy: admin._id },
            { name: 'Sarah Mitchell', company: 'DesignStudio UK', email: 'sarah@designstudio.co.uk', rating: 5, content: 'The UI/UX work from Nexura was outstanding. Karan and the team brought our app to life with beautiful, intuitive designs. Our users love it!', service: 'UI/UX Design', status: 'Approved', isPublished: true, featured: true, publishedDate: new Date('2025-03-10'), reviewedBy: admin._id },
            { name: 'Pradeep Verma', company: 'StartupLaunch', email: 'pradeep@startuplaunch.in', rating: 4, content: 'Great team to work with. They understood our requirements quickly and delivered a solid MVP. Minor delays but overall very satisfied.', service: 'Web Development', status: 'Approved', isPublished: true, featured: false, publishedDate: new Date('2025-02-20'), reviewedBy: admin._id },
            { name: 'Emily Watson', company: 'CreativeAgency', email: 'emily@creativeagency.com', rating: 5, content: 'The branding work Nexura did for us was transformative. Our new identity perfectly captures who we are. The process was collaborative and fun.', service: 'Graphics Design', status: 'Approved', isPublished: true, featured: false, publishedDate: new Date('2025-01-15'), reviewedBy: admin._id },
            { name: 'Rohan Kapoor', company: 'FinTech Startup', email: 'rohan@fintechstartup.com', rating: 4, content: 'Solid development work. The dashboard they built is fast and clean. Would definitely work with Nexura again for our next phase.', service: 'Web Development', status: 'Approved', isPublished: true, featured: false, publishedDate: new Date('2025-02-05'), reviewedBy: admin._id },
            { name: 'Ananya Singh', company: 'EduTech Co', email: 'ananya@edutech.co', rating: 3, content: 'Good work overall but communication could be improved. The final product was good but we had to follow up multiple times for updates.', service: 'Web Development', status: 'Pending', isPublished: false },
            { name: 'James Carter', company: 'FinEdge Corp', email: 'james@finedge.com', rating: 5, content: 'Early days of our project but the discovery phase was excellent. Nexura asked the right questions and the prototype looks exactly what we envisioned.', service: 'Web Development', status: 'Pending', isPublished: false }
        ]);
        console.log('✅ Reviews created.');

        // ─── 12. JOBS ────────────────────────────────────────────────────────
        console.log('🌱 Seeding Jobs...');
        const jobs = await Job.insertMany([
            {
                title: 'Senior React Developer',
                department: 'Engineering',
                location: 'Ahmedabad / Remote',
                type: 'Full-time',
                description: 'We are looking for a Senior React Developer to join our growing team. You will work on exciting client projects and help mentor junior developers.',
                requirements: ['5+ years React experience', 'Strong TypeScript skills', 'Experience with Node.js', 'Familiarity with AWS or GCP', 'Good communication skills'],
                status: 'Open'
            },
            {
                title: 'UI/UX Designer',
                department: 'Design',
                location: 'Ahmedabad',
                type: 'Full-time',
                description: 'Join our design team to create beautiful, user-centered digital experiences for our clients across web and mobile.',
                requirements: ['3+ years UI/UX experience', 'Expert in Figma', 'Portfolio of shipped products', 'Understanding of design systems', 'User research experience'],
                status: 'Open'
            },
            {
                title: 'Node.js Backend Developer',
                department: 'Engineering',
                location: 'Remote',
                type: 'Contract',
                description: 'We need a skilled Node.js developer for a 6-month contract to help build scalable APIs for our e-commerce client.',
                requirements: ['4+ years Node.js experience', 'MongoDB and PostgreSQL', 'REST API design', 'Experience with payment gateways', 'Docker knowledge'],
                status: 'Open'
            },
            {
                title: 'Digital Marketing Executive',
                department: 'Marketing',
                location: 'Ahmedabad',
                type: 'Full-time',
                description: 'Drive Nexura\'s digital presence through SEO, content marketing, and social media campaigns.',
                requirements: ['2+ years digital marketing', 'SEO/SEM expertise', 'Content writing skills', 'Google Analytics', 'Social media management'],
                status: 'Closed'
            },
            {
                title: 'React Native Developer (Intern)',
                department: 'Engineering',
                location: 'Ahmedabad',
                type: 'Internship',
                description: 'A 3-month internship for passionate mobile developers. Work on real client projects and learn from experienced engineers.',
                requirements: ['Basic React knowledge', 'Familiarity with mobile development', 'Eager to learn', 'Good problem-solving skills'],
                status: 'Draft'
            }
        ]);
        console.log('✅ Jobs created.');

        // ─── 13. JOB APPLICATIONS ────────────────────────────────────────────
        console.log('🌱 Seeding Job Applications...');
        const openJobs = jobs.filter(j => j.status === 'Open');
        await JobApplication.insertMany([
            { job: openJobs[0]._id, applicantName: 'Nikhil Agarwal', email: 'nikhil@gmail.com', phone: '+91 98001 55001', resume: 'https://drive.google.com/resume-nikhil.pdf', coverLetter: 'I have 6 years of React experience and have worked on large-scale SaaS products. Excited to join Nexura!', status: 'Interview Scheduled' },
            { job: openJobs[0]._id, applicantName: 'Pooja Reddy', email: 'pooja.reddy@outlook.com', phone: '+91 97001 55002', resume: 'https://drive.google.com/resume-pooja.pdf', coverLetter: 'Frontend developer with strong TypeScript and testing skills. Looking for a collaborative team.', status: 'Reviewed' },
            { job: openJobs[0]._id, applicantName: 'Siddharth Rao', email: 'sid.rao@gmail.com', phone: '+91 96001 55003', resume: 'https://drive.google.com/resume-sid.pdf', coverLetter: 'Passionate about React and open source. Contributed to several popular libraries.', status: 'Pending' },
            { job: openJobs[1]._id, applicantName: 'Riya Patel', email: 'riya.patel@gmail.com', phone: '+91 95001 55004', resume: 'https://drive.google.com/resume-riya.pdf', coverLetter: 'UI/UX designer with a strong portfolio in fintech and edtech products. Figma expert.', status: 'Interview Scheduled' },
            { job: openJobs[1]._id, applicantName: 'Aditya Kumar', email: 'aditya.k@yahoo.com', phone: '+91 94001 55005', resume: 'https://drive.google.com/resume-aditya.pdf', coverLetter: 'Graphic designer transitioning to UX. Completed Google UX Design Certificate.', status: 'Rejected', notes: 'Not enough UX experience for senior role.' },
            { job: openJobs[2]._id, applicantName: 'Farhan Sheikh', email: 'farhan@gmail.com', phone: '+91 93001 55006', resume: 'https://drive.google.com/resume-farhan.pdf', coverLetter: 'Backend developer with 5 years Node.js experience. Built payment systems for 3 startups.', status: 'Hired' }
        ]);
        console.log('✅ Job Applications created.');

        // ─── 14. CONTACTS ────────────────────────────────────────────────────
        console.log('🌱 Seeding Contacts...');
        await Contact.insertMany([
            { name: 'Deepak Malhotra', email: 'deepak@businessco.com', subject: 'Website Development Quote', message: 'Hi, we need a corporate website for our manufacturing company. Looking for a quote for a 10-page website with a product catalog. Please get in touch.', status: 'New' },
            { name: 'Lisa Thompson', email: 'lisa@fashionbrand.com', subject: 'E-Commerce Store Development', message: 'We are a fashion brand looking to launch an online store. Need Shopify or custom solution. Budget is flexible for the right team.', status: 'In Progress', adminNotes: 'Scheduled call for April 20th.' },
            { name: 'Suresh Pillai', email: 'suresh@logisticsco.in', subject: 'Mobile App for Delivery Tracking', message: 'We need a mobile app for our delivery drivers and customers to track shipments in real-time. Looking for React Native development.', status: 'In Progress', adminNotes: 'Sent proposal on April 15th. Awaiting response.' },
            { name: 'Natasha Brown', email: 'natasha@ngo.org', subject: 'Website for Non-Profit', message: 'We are a non-profit organization and need a website to showcase our work and accept donations. Do you offer any discounts for NGOs?', status: 'Resolved', adminNotes: 'Offered 20% NGO discount. Project started.' },
            { name: 'Harish Gupta', email: 'harish@realestate.com', subject: 'Real Estate Portal', message: 'Looking for a real estate listing portal with property search, filters, and agent dashboard. Please share your portfolio and pricing.', status: 'New' },
            { name: 'Zara Ali', email: 'zara@restaurant.com', subject: 'Restaurant Website + Online Ordering', message: 'Need a website for our restaurant chain with online ordering and table reservation system. We have 5 locations.', status: 'Archived', adminNotes: 'Client went with another vendor.' }
        ]);
        console.log('✅ Contacts created.');

        // ─── 15. SUBSCRIBERS ─────────────────────────────────────────────────
        console.log('🌱 Seeding Subscribers...');
        await Subscriber.insertMany([
            { email: 'tech.enthusiast@gmail.com', status: 'Active' },
            { email: 'startup.founder@outlook.com', status: 'Active' },
            { email: 'design.lover@yahoo.com', status: 'Active' },
            { email: 'dev.community@gmail.com', status: 'Active' },
            { email: 'business.owner@company.com', status: 'Active' },
            { email: 'old.subscriber@gmail.com', status: 'Unsubscribed' }
        ]);
        console.log('✅ Subscribers created.');

        // ─── DONE ─────────────────────────────────────────────────────────────
        console.log('\n🎉 ALL DATA SEEDED SUCCESSFULLY!');
        console.log('\n═══════════════════════════════════════════');
        console.log('  LOGIN CREDENTIALS (password: password123)');
        console.log('═══════════════════════════════════════════');
        console.log('  Admin:           admin@nexura.com');
        console.log('  HR Manager:      hr@nexura.com');
        console.log('  Project Manager: pm@nexura.com');
        console.log('  Team Lead:       lead@nexura.com');
        console.log('  Frontend Dev:    dev@nexura.com');
        console.log('  UI Designer:     design@nexura.com');
        console.log('═══════════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

clearAndSeedDatabase();
