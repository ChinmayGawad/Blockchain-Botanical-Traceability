package com.florachain.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lab_test_parameters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTestParameterEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "param_value", nullable = false, length = 64)
    private String value;

    @Column(name = "unit", nullable = false, length = 32)
    private String unit;

    @Column(name = "standard_limit", nullable = false, length = 64)
    private String standardLimit;

    @Column(name = "passed", nullable = false)
    private Boolean passed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_report_id")
    private LabReportEntity labReport;
}
