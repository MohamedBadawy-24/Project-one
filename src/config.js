import { Timestamp } from "mongodb";
import mongoose from "mongoose";

// Connect to MongoDB
const connect = mongoose.connect("mongodb+srv://hilltopheaven125:Badawy-123@cluster0.wudxfn1.mongodb.net/");

connect.then((db) => {
    console.log('Database Connected successfully');
})
.catch(() => {
    console.log('Failed to Connect Database');
});

// Define your schemas
const Loginschema = new mongoose.Schema({
    fName: {
        type: String,
        required: true
    },
    lName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    phone: {
        type :String,
        required: true
    }
});

const bookschema = new mongoose.Schema({
    cName: {
        type: String,
        required: true
    },
    cEmail: {
        type: String,
        required: true
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    numberOfPeople:{
        type: String,
        required:true
    },
    cNumber:{
        type :String,
        required:true
    },
    comment:{
        type: String,
        required:false
    }
});
const rentschema = new mongoose.Schema({
    pLocation: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                // Get the current date without the time component
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);

                // Strip the time component from the value
                const startDate = new Date(value);
                startDate.setHours(0, 0, 0, 0);

                // Compare the start date with the current date
                return startDate >= currentDate;
            },
            message: props => `Start date (${props.value}) cannot be before today's date.`
        }
    },
    endDate: {
        type: Date,
        required: true
    },
    pTime: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{2}:\d{2}$/.test(v); // Validates the time format HH:mm
            },
            message: props => `${props.value} is not a valid time format!`
        }
    },

    carType:{
        type: String,
        required:true
    }
});

// Create models based on the schemas
const Book = mongoose.model('Book', bookschema);
const Login = mongoose.model('Login', Loginschema);
const Rent = mongoose.model('Rent', rentschema);

// Export the models
export { Login, Book, Rent };