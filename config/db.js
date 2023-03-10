import mongoose from "mongoose"; //npm install 'mongoose'
mongoose.set('strictQuery', false);
import chalk from "chalk";

const options = {
  autoIndex: false, // Don't build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};



const dbConnect = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, options);
    const url = `${connection.connection.host} : ${connection.connection.port}`;

    console.log(chalk.inverse(`***** BASE DE DATOS CONECTADA EN ${url} *****`));
  } catch (error) {
    console.log(`error : ${error.message}`);
    process.exit(1);
  }
};

export default dbConnect
