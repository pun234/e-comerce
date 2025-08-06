import bcrypt from "bcrypt";
export let otpStore = {};

export const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateOTP = (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; 
  return otp;
};

export const verifyOTP = (email, inputOtp) => {
  const record = otpStore[email];
  if (!record) return false;
  const isValid = record.otp === inputOtp && Date.now() < record.expires;
  return isValid;
};