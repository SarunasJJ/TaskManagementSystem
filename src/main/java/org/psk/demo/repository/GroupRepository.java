package org.psk.demo.repository;

import org.psk.demo.entity.Group;
import org.psk.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    // Check if group name already exists
    boolean existsByName(String name);

    // Find group by name
    Optional<Group> findByName(String name);

    // Find groups created by a specific user
    List<Group> findByCreatorOrderByCreatedAtDesc(User creator);

    // Find groups where user is a member
    @Query("SELECT g FROM Group g JOIN g.members m WHERE m = :user ORDER BY g.createdAt DESC")
    List<Group> findGroupsByMember(@Param("user") User user);

    // Find all groups where user is either creator or member
    @Query("SELECT DISTINCT g FROM Group g LEFT JOIN g.members m WHERE g.creator = :user OR m = :user ORDER BY g.createdAt DESC")
    List<Group> findGroupsByCreatorOrMember(@Param("user") User user);

    // Count members in a group
    @Query("SELECT SIZE(g.members) FROM Group g WHERE g.id = :groupId")
    int countMembersByGroupId(@Param("groupId") Long groupId);
}