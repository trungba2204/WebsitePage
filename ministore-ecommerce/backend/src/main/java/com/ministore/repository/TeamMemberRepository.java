package com.ministore.repository;

import com.ministore.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    
    List<TeamMember> findByIsActiveTrueOrderByCreatedAtDesc();
    
    List<TeamMember> findAllByOrderByCreatedAtDesc();
}
