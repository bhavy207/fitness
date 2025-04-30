import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { CircularProgress } from "@mui/material";
import { EmailOutlined, CheckCircleOutline } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const Container = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.bg};
  padding: 20px;
`;

const Card = styled.div`
  width: 100%;
  max-width: 500px;
  background: ${({ theme }) => theme.card};
  border-radius: 16px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 36px;
  box-shadow: 0px 4px 24px rgba(0, 0, 0, 0.1);
  @media (max-width: 600px) {
    padding: 24px;
  }
`;

const Title = styled.h1`
  font-size: 30px;
  font-weight: 700;
  color: ${({ theme }) => theme.text_primary};
  text-align: center;
`;

const Description = styled.p`
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.text_secondary};
  text-align: center;
  margin-top: 8px;
`;

const OTPInputContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 32px 0;
`;

const OTPInput = styled.input`
  width: 54px;
  height: 54px;
  border: 1px solid
    ${({ theme, error }) => (error ? theme.red : theme.text_secondary + "40")};
  border-radius: 8px;
  font-size: 24px;
  font-weight: 500;
  text-align: center;
  color: ${({ theme }) => theme.text_primary};
  background: ${({ theme }) => theme.input};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme, error }) => (error ? theme.red : theme.primary)};
    box-shadow: 0 0 0 2px
      ${({ theme, error }) => (error ? theme.red + "30" : theme.primary + "30")};
  }

  @media (max-width: 400px) {
    width: 40px;
    height: 40px;
  }
`;

const Button = styled.button`
  padding: 14px;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 12px;

  &:hover {
    background: ${({ theme }) => theme.primary_dark || theme.primary};
  }

  &:disabled {
    background: ${({ theme }) => theme.disabled};
    cursor: not-allowed;
  }
`;

const OutlinedButton = styled(Button)`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.primary};

  &:hover {
    background: ${({ theme }) => theme.primary + "10"};
  }

  &:disabled {
    border-color: ${({ theme }) => theme.disabled};
    color: ${({ theme }) => theme.disabled};
    background: transparent;
  }
`;

const TimerText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.text_secondary};
  margin-top: 16px;
  text-align: center;
`;

const ResendButton = styled.span`
  color: ${({ theme, disabled }) =>
    disabled ? theme.text_secondary + "70" : theme.primary};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    text-decoration: ${({ disabled }) => (disabled ? "none" : "underline")};
  }
`;

const Message = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 8px;
  background: ${({ theme, error, success }) =>
    error ? theme.red + "15" : success ? theme.green + "15" : "transparent"};
  color: ${({ theme, error, success }) =>
    error ? theme.red : success ? theme.green : theme.text_primary};
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme, success }) =>
    success ? theme.green + "15" : theme.primary + "15"};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 16px 0;
`;

const Otp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your email";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verified, setVerified] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus on first input when component mounts
    inputRefs.current[0]?.focus();

    // Start countdown timer
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const handleResendOTP = () => {
    if (timer > 0) return;

    setResendLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMessage("OTP resent successfully!");
      setError(false);
      setTimer(60);
      setResendLoading(false);
    }, 1500);
  };

  const handleVerifyOTP = () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setMessage("Please enter the complete 6-digit OTP");
      setError(true);
      return;
    }

    setLoading(true);

    // Simulate verification (replace with actual API call)
    setTimeout(() => {
      // For demo: Check if OTP is "123456"
      if (otpString === "123456") {
        setMessage("Email verified successfully!");
        setError(false);
        setSuccess(true);

        // Show success state after verification
        setTimeout(() => {
          setVerified(true);
        }, 1000);
      } else {
        setMessage("Invalid OTP. Please try again.");
        setError(true);
        setSuccess(false);
      }
      setLoading(false);
    }, 1500);
  };

  const handleContinue = () => {
    navigate("/login"); // Navigate to login page after verification
  };

  const handleInputChange = (index, value) => {
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) return;

    // Update the OTP state
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear any previous error messages when user is typing
    if (error) {
      setMessage("");
      setError(false);
    }

    // Move to next input if current input is filled
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleInputKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleInputPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Check if pasted content is numeric and has at most 6 digits
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.slice(0, 6).split("");
      const newOtp = [...otp];

      // Fill available inputs with pasted digits
      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });

      setOtp(newOtp);

      // Focus on the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex((val) => !val);
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        inputRefs.current[nextEmptyIndex].focus();
      } else if (digits.length > 0) {
        inputRefs.current[Math.min(digits.length - 1, 5)].focus();
      }
    }
  };

  if (verified) {
    return (
      <Container>
        <Card>
          <SuccessContainer>
            <IconContainer success>
              <CheckCircleOutline sx={{ fontSize: 40, color: "green" }} />
            </IconContainer>
            <Title>Email Verified!</Title>
            <Description>
              Your email has been successfully verified.
            </Description>
            <Button onClick={handleContinue} style={{ marginTop: 24 }}>
              Continue to Login
            </Button>
          </SuccessContainer>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <div>
          <IconContainer>
            <EmailOutlined
              sx={{ fontSize: 40, color: (theme) => theme.primary }}
            />
          </IconContainer>
          <Title>Email Verification</Title>
          <Description>
            We've sent a verification code to <b>{email}</b>.<br />
            Please enter the code below.
          </Description>
        </div>

        <div>
          <OTPInputContainer>
            {otp.map((digit, index) => (
              <OTPInput
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(index, e)}
                onPaste={(e) => handleInputPaste(e)}
                autoComplete="off"
                error={error}
              />
            ))}
          </OTPInputContainer>

          {message && (
            <Message error={error} success={success}>
              {message}
            </Message>
          )}

          <TimerText>
            Didn't receive the code?{" "}
            {resendLoading ? (
              <CircularProgress size={14} />
            ) : timer > 0 ? (
              `Resend in ${timer}s`
            ) : (
              <ResendButton onClick={handleResendOTP} disabled={timer > 0}>
                Resend OTP
              </ResendButton>
            )}
          </TimerText>

          <div className="flex gap-2">
            <Button
              onClick={handleVerifyOTP}
              disabled={otp.some((digit) => !digit) || loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Verify Email"
              )}
            </Button>

            <OutlinedButton
              onClick={() => navigate("/login")}
              style={{ marginTop: 12 }}
            >
              Back to Login
            </OutlinedButton>
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default Otp;
