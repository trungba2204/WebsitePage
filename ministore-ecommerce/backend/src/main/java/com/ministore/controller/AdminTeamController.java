package com.ministore.controller;

import com.ministore.dto.CreateTeamMemberRequest;
import com.ministore.dto.UpdateTeamMemberRequest;
import com.ministore.entity.TeamMember;
import com.ministore.repository.TeamMemberRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/team")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminTeamController {

    private final TeamMemberRepository teamMemberRepository;

    @GetMapping
    public ResponseEntity<List<TeamMember>> getAllTeamMembers() {
        List<TeamMember> teamMembers = teamMemberRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(teamMembers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamMember> getTeamMemberById(@PathVariable Long id) {
        return teamMemberRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TeamMember> createTeamMember(@Valid @RequestBody CreateTeamMemberRequest request) {
        TeamMember teamMember = TeamMember.builder()
                .name(request.getName())
                .position(request.getPosition())
                .image(request.getImage())
                .bio(request.getBio())
                .isActive(request.getIsActive())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        TeamMember savedMember = teamMemberRepository.save(teamMember);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedMember);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeamMember> updateTeamMember(@PathVariable Long id, @Valid @RequestBody UpdateTeamMemberRequest request) {
        return teamMemberRepository.findById(id)
                .map(existingMember -> {
                    existingMember.setName(request.getName());
                    existingMember.setPosition(request.getPosition());
                    existingMember.setImage(request.getImage());
                    existingMember.setBio(request.getBio());
                    existingMember.setIsActive(request.getIsActive());
                    existingMember.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(teamMemberRepository.save(existingMember));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeamMember(@PathVariable Long id) {
        if (!teamMemberRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        teamMemberRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
