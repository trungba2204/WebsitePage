package com.ministore.controller;

import com.ministore.entity.TeamMember;
import com.ministore.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/team")
@RequiredArgsConstructor
@Slf4j
public class TeamController {

    private final TeamMemberRepository teamMemberRepository;

    @GetMapping
    public ResponseEntity<List<TeamMember>> getActiveTeamMembers() {
        log.info("Fetching active team members...");
        List<TeamMember> activeMembers = teamMemberRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        log.info("Found {} active team members", activeMembers.size());
        return ResponseEntity.ok(activeMembers);
    }
}
