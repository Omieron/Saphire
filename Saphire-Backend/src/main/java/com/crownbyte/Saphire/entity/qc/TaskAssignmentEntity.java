package com.crownbyte.Saphire.entity.qc;

import com.crownbyte.Saphire.entity.master.UserEntity;
import com.crownbyte.Saphire.entity.qc.enums.TaskAssignmentTypeEnum;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "task_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskAssignmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private QcFormTemplateEntity template;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskAssignmentTypeEnum type;

    @Column(name = "machine_id")
    private Long machineId;

    @Column(name = "product_id")
    private Long productId;

    @Builder.Default
    private Boolean active = true;

    @ManyToMany
    @JoinTable(
        name = "task_assignment_users",
        joinColumns = @JoinColumn(name = "assignment_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private List<UserEntity> assignedUsers = new ArrayList<>();

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TaskScheduleEntity> schedules = new ArrayList<>();

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
