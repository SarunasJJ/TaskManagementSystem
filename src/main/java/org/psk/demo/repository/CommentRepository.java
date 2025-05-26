package org.psk.demo.repository;

import org.psk.demo.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByGroupIdOrderByCreatedAtDesc(Long groupId);

    List<Comment> findByGroupIdOrderByCreatedAtAsc(Long groupId);

    List<Comment> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    long countByGroupId(Long groupId);

    // Find recent comments in a group (last 24 hours)
    @Query("SELECT c FROM Comment c WHERE c.groupId = :groupId AND c.createdAt >= :since ORDER BY c.createdAt DESC")
    List<Comment> findRecentCommentsByGroupId(@Param("groupId") Long groupId, @Param("since") LocalDateTime since);

    void deleteByGroupId(Long groupId);
}