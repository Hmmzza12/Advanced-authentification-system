package com.auth.backend.util;

import org.apache.commons.codec.binary.Base32;
import org.apache.commons.codec.binary.Hex;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

@Component
public class TOTPGenerator {

    private static final String HMAC_ALGO = "HmacSHA1";
    private static final int SECRET_SIZE = 10;
    private static final int TIME_STEP = 30;

    public String generateSecret() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[SECRET_SIZE];
        random.nextBytes(bytes);
        Base32 base32 = new Base32();
        return base32.encodeToString(bytes);
    }

    public String generateTOTP(String secretKey) {
        long timeWindow = System.currentTimeMillis() / 1000 / TIME_STEP;
        return generateTOTPByTimeWindow(secretKey, timeWindow);
    }

    public boolean verifyCode(String secretKey, String code) {
        long timeWindow = System.currentTimeMillis() / 1000 / TIME_STEP;
        // Check current, previous, and next window for slight time drift
        for (int i = -1; i <= 1; i++) {
            String hash = generateTOTPByTimeWindow(secretKey, timeWindow + i);
            if (hash.equals(code)) {
                return true;
            }
        }
        return false;
    }

    private String generateTOTPByTimeWindow(String secretKey, long timeWindow) {
        try {
            Base32 base32 = new Base32();
            byte[] bytes = base32.decode(secretKey);
            String hexKey = Hex.encodeHexString(bytes);
            return generateHOTP(hexKey, Long.toHexString(timeWindow));
        } catch (Exception e) {
            throw new RuntimeException("Error generating TOTP", e);
        }
    }

    private String generateHOTP(String key, String time) throws NoSuchAlgorithmException, InvalidKeyException {
        while (time.length() < 16) {
            time = "0" + time;
        }

        byte[] msg;
        byte[] k;
        try {
            msg = Hex.decodeHex(time.toCharArray());
            k = Hex.decodeHex(key.toCharArray());
        } catch (org.apache.commons.codec.DecoderException e) {
            throw new RuntimeException("Error decoding hex string", e);
        }

        Mac hmac = Mac.getInstance(HMAC_ALGO);
        SecretKeySpec macKey = new SecretKeySpec(k, "RAW");
        hmac.init(macKey);
        byte[] hash = hmac.doFinal(msg);

        int offset = hash[hash.length - 1] & 0xf;
        int binary = ((hash[offset] & 0x7f) << 24) |
                ((hash[offset + 1] & 0xff) << 16) |
                ((hash[offset + 2] & 0xff) << 8) |
                (hash[offset + 3] & 0xff);

        int otp = binary % 1000000;
        StringBuilder result = new StringBuilder(Integer.toString(otp));
        while (result.length() < 6) {
            result.insert(0, "0");
        }
        return result.toString();
    }
}
