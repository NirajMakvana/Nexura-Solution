import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

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
import Counter from '../models/Counter.js'; // Needed due to pre-save hook on User
import Invoice from '../models/Invoice.js';

dotenv.config();

const clearAndSeedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexura-solution');
        console.log('✅ Connected to MongoDB');

        // 1. CLEAR DATABASE
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Employee.deleteMany({});
        await Client.deleteMany({});
        await Project.deleteMany({});
        await Task.deleteMany({});
        await Attendance.deleteMany({});
        await Leave.deleteMany({});
        await Payslip.deleteMany({});
        await Blog.deleteMany({});
        await Review.deleteMany({});
        await Job.deleteMany({});
        await JobApplication.deleteMany({});
        await Contact.deleteMany({});
        await Subscriber.deleteMany({});
        await Counter.deleteMany({});
        await Invoice.deleteMany({});
        console.log('✅ Database cleared.');

        // 2. SEED USERS & EMPLOYEES
        console.log('🌱 Seeding Users & Employees...');
        const salt = await bcrypt.genSalt(12);
        const defaultPassword = 'password123';

        // Helper to create user (User model pre-save hook handles hashing if we directly use create, 
        // but the original seed file bypassed standard creation sometimes. Let's use standard User.create)
        const usersData = [
            { firstName: 'Admin', lastName: 'Nexura', email: 'admin@nexura.com', role: 'admin', department: 'Management', position: 'Administrator', password: defaultPassword },
            { firstName: 'HR', lastName: 'Manager', email: 'hr@nexura.com', role: 'hr', department: 'Human Resources', position: 'HR Manager', password: defaultPassword },
            { firstName: 'Project', lastName: 'Manager', email: 'pm@nexura.com', role: 'manager', department: 'Development', position: 'Project Manager', password: defaultPassword },
            { firstName: 'Senior', lastName: 'Dev', email: 'lead@nexura.com', role: 'employee', department: 'Development', position: 'Team Lead', password: defaultPassword },
            { firstName: 'Frontend', lastName: 'Dev', email: 'dev@nexura.com', role: 'employee', department: 'Development', position: 'Frontend Developer', password: defaultPassword },
            { firstName: 'UI', lastName: 'Designer', email: 'design@nexura.com', role: 'employee', department: 'Design', position: 'UI/UX Designer', password: defaultPassword }
        ];

        const users = [];
        const employees = [];

        for (const data of usersData) {
            const user = await User.create(data); // User model pre-save hook handles employeeId generation and password hashing
            users.push(user);

            // Create corresponding Employee record
            const employee = await Employee.create({
                user: user._id,
                employeeId: user.employeeId,
                department: data.department,
                position: data.position,
                salary: { basic: 50000, hra: 10000, allowances: 5000, deductions: 2000 },
                skills: ['Communication', 'Teamwork', data.department === 'Development' ? 'Coding' : 'Design']
            });
            employees.push(employee);
        }

        const [admin, hr, pm, lead, dev, designer] = users;
        console.log('✅ Respective users and employees created.');


        // 3. SEED CLIENTS
        console.log('🌱 Seeding Clients...');
        const clients = await Client.insertMany([
            { name: 'John Doe', email: 'john@techcorp.com', phone: '1234567890', company: 'TechCorp Ltd', address: 'New York, USA', status: 'Active' },
            { name: 'Jane Smith', email: 'jane@designstudio.com', phone: '0987654321', company: 'DesignStudio', address: 'London, UK', status: 'Active' },
            { name: 'Raj Kumar', email: 'raj@retailhub.in', phone: '9876512340', company: 'RetailHub', address: 'Mumbai, India', status: 'Active' }
        ]);
        console.log('✅ Clients created.');

        // 4. SEED PROJECTS
        console.log('🌱 Seeding Projects...');
        const projects = await Project.insertMany([
            { name: 'TechCorp Website Redesign', description: 'Complete overhaul of website', client: clients[0]._id, team: [{ employee: dev._id, role: 'Developer' }, { employee: designer._id, role: 'Designer' }], startDate: new Date('2025-01-01'), endDate: new Date('2025-02-15'), budget: 20000, status: 'Completed', priority: 'High', progress: 100, category: 'Web Development' },
            { name: 'DesignStudio App', description: 'Mobile app UI/UX design', client: clients[1]._id, team: [{ employee: designer._id, role: 'Lead Designer' }, { employee: lead._id, role: 'Reviewer' }], startDate: new Date('2025-02-01'), endDate: new Date('2025-04-30'), budget: 15000, status: 'In Progress', priority: 'Medium', progress: 45, category: 'UI/UX Design' },
            { name: 'RetailHub E-commerce', description: 'New e-commerce platform', client: clients[2]._id, team: [{ employee: pm._id, role: 'Manager' }, { employee: dev._id, role: 'Developer' }], startDate: new Date('2025-03-15'), endDate: new Date('2025-06-15'), budget: 50000, status: 'Planning', priority: 'High', progress: 0, category: 'Web Development' }
        ]);
        console.log('✅ Projects created.');

        // 5. SEED TASKS
        console.log('🌱 Seeding Tasks...');
        await Task.insertMany([
            { title: 'Create Wireframes', description: 'Initial wireframes for app', project: projects[1]._id, assignedTo: designer._id, assignedBy: pm._id, priority: 'High', status: 'Completed', dueDate: new Date('2025-02-10') },
            { title: 'Design Homepage', description: 'High fidelity design of homepage', project: projects[1]._id, assignedTo: designer._id, assignedBy: pm._id, priority: 'High', status: 'In Progress', dueDate: new Date('2025-03-10') },
            { title: 'Setup Backend Auth', description: 'Configure JWT auth', project: projects[2]._id, assignedTo: lead._id, assignedBy: pm._id, priority: 'High', status: 'To Do', dueDate: new Date('2025-03-20') },
            { title: 'Frontend Header Component', description: 'Build responsive header', project: projects[2]._id, assignedTo: dev._id, assignedBy: pm._id, priority: 'Medium', status: 'To Do', dueDate: new Date('2025-03-25') }
        ]);
        console.log('✅ Tasks created.');

        // 6. SEED HR DATA (Attendance, Leaves, Payslips)
        console.log('🌱 Seeding HR Data...');
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            await Attendance.insertMany([
                { employee: dev._id, date: d, clockIn: new Date(d.setHours(9, 0, 0)), clockOut: new Date(d.setHours(18, 0, 0)), totalHours: 9, status: 'Present', location: 'Office' },
                { employee: designer._id, date: d, clockIn: new Date(d.setHours(9, 30, 0)), clockOut: new Date(d.setHours(18, 30, 0)), totalHours: 9, status: 'Present', location: 'Remote' }
            ]);
        }

        await Leave.insertMany([
            { employee: dev._id, type: 'Sick Leave', startDate: new Date('2025-02-15'), endDate: new Date('2025-02-16'), days: 2, reason: 'Viral Fever', status: 'Approved', approvedBy: hr._id, appliedOn: new Date('2025-02-14') },
            { employee: designer._id, type: 'Casual Leave', startDate: new Date('2025-03-20'), endDate: new Date('2025-03-21'), days: 2, reason: 'Family Function', status: 'Pending', appliedOn: new Date('2025-03-01') }
        ]);

        await Payslip.insertMany([
            { employee: dev._id, month: 'February', year: 2025, basicSalary: 50000, hra: 10000, allowances: 5000, deductions: 2000, netSalary: 63000, status: 'Paid', paymentDate: new Date('2025-02-28') }
        ]);
        console.log('✅ HR Data created.');

        // 7. SEED INVOICES
        console.log('🌱 Seeding Invoices...');
        await Invoice.insertMany([
            { invoiceNumber: 'INV-001', client: clients[0]._id, project: projects[0]._id, issueDate: new Date('2025-02-15'), dueDate: new Date('2025-03-01'), items: [{ description: 'Web Development Services', quantity: 1, rate: 20000, amount: 20000 }], subtotal: 20000, taxPercentage: 18, tax: 3600, discount: 0, total: 23600, status: 'paid', paidDate: new Date('2025-02-20') },
            { invoiceNumber: 'INV-002', client: clients[1]._id, project: projects[1]._id, issueDate: new Date('2025-03-01'), dueDate: new Date('2025-03-15'), items: [{ description: 'UI/UX Design Phase 1', quantity: 1, rate: 7500, amount: 7500 }], subtotal: 7500, taxPercentage: 18, tax: 1350, discount: 0, total: 8850, status: 'sent' }
        ]);
        console.log('✅ Invoices created.');

        // 8. SEED PUBLIC FACING DATA
        console.log('🌱 Seeding Public Data (Blogs, Reviews, Jobs, etc.)...');

        const blogsData = [
            { title: 'The Future of Web Development', excerpt: 'Trends to watch in 2025', content: 'Lorem ipsum...', category: 'technology', author: 'Project Manager', authorRole: 'Tech Lead', status: 'published', views: 120, featured: true },
            { title: 'Why UI/UX Matters', excerpt: 'Design thinking in modern apps', content: 'Lorem ipsum...', category: 'ui-ux-design', author: 'UI Designer', authorRole: 'Lead Designer', status: 'published', views: 85, featured: false },
            { title: 'Company Retreat 2025', excerpt: 'Fun times with the team', content: 'Lorem ipsum...', category: 'company-news', author: 'HR Manager', authorRole: 'HR Head', status: 'draft', views: 0, featured: false }
        ];

        for (const bData of blogsData) {
            await Blog.create(bData);
        }

        await Review.insertMany([
            { name: 'John Doe', company: 'TechCorp Ltd', email: 'john@techcorp.com', rating: 5, content: 'Excellent website delivery. Highly recommended!', service: 'Web Development', status: 'Approved', isPublished: true, publishedDate: new Date('2025-02-20'), reviewedBy: admin._id },
            { name: 'Alice Ray', company: 'Startup Inc', email: 'alice@startup.com', rating: 4, content: 'Great design work, very responsive team.', service: 'UI/UX Design', status: 'Approved', isPublished: true, publishedDate: new Date('2025-02-25'), reviewedBy: admin._id },
            { name: 'Bob Smith', company: 'Local Shop', email: 'bob@localshop.com', rating: 3, content: 'Good work but delayed by a week.', service: 'Web Development', status: 'Pending', isPublished: false }
        ]);

        await Job.insertMany([
            { title: 'Full Stack React Native Developer', department: 'Engineering', location: 'Remote', type: 'Full-time Remote', experience: '3-5 years', description: 'Looking for a skilled developer.', requirements: ['React Native', 'Node.js'], responsibilities: ['Build Apps', 'Maintain APIs'], salary: '$80,000 - $120,000', status: 'Open', postedBy: hr._id },
            { title: 'Marketing Executive', department: 'Marketing', location: 'Ahmedabad', type: 'Full-time', experience: '1-3 years', description: 'Looking for a marketing rockstar.', requirements: ['SEO', 'Content Writing'], responsibilities: ['Lead Generation'], status: 'On Hold', postedBy: hr._id }
        ]);

        const activeJobArray = await Job.find({ status: 'Open' }).limit(1);
        if (activeJobArray.length > 0) {
            await JobApplication.insertMany([
                { job: activeJobArray[0]._id, firstName: 'Test', lastName: 'Applicant', email: 'test@applicant.com', phone: '9876543210', linkedinProfile: 'https://linkedin.com/in/test', portfolio: 'https://test.com', coverLetter: 'I am interested.', experience: '2 years', status: 'Pending', resumeUrl: 'dummy.pdf' }
            ]);
        }

        await Contact.insertMany([
            { name: 'Interested Client', email: 'interested@company.com', phone: '1231231234', subject: 'Need a website', message: 'Hello, need a quote for a website.', status: 'New', priority: 'High' }
        ]);

        await Subscriber.insertMany([
            { email: 'newsletter1@example.com', status: 'Active' },
            { email: 'newsletter2@example.com', status: 'Active' }
        ]);

        console.log('✅ Public Data created.');

        console.log('\n🎉 ALL MODULES SEEDED SUCCESSFULLY!');
        console.log('\n=======================================');
        console.log('Use these credentials to test:');
        console.log('Password for all: password123');
        console.log('1. Admin: admin@nexura.com');
        console.log('2. HR Manager: hr@nexura.com');
        console.log('3. Project Manager: pm@nexura.com');
        console.log('4. Team Lead: lead@nexura.com');
        console.log('5. Frontend Dev: dev@nexura.com');
        console.log('6. UI Designer: design@nexura.com');
        console.log('=======================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Reset & Seeding failed:', error);
        process.exit(1);
    }
};

clearAndSeedDatabase();
