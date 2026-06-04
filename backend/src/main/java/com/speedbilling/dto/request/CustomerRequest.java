package com.speedbilling.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CustomerRequest {
    @NotBlank(message = "Customer name is required")
    private String name;

    private String phoneNumber;
    private String email;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private LocalDate dateOfBirth;
    private String gender;
    private String photoUrl;

    // Hair extension fields
    private String hairExtensionType;
    private String hairLength;
    private String hairColor;
    private LocalDate installationDate;

    private String status;
    private String notes;
    private String referredBy;
}
