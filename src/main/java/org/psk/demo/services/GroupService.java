package org.psk.demo.services;

import org.psk.demo.dto.request.CreateGroupRequest;
import org.psk.demo.dto.response.GroupResponse;
import org.psk.demo.entity.Group;
import org.psk.demo.entity.User;
import org.psk.demo.repository.GroupRepository;
import org.psk.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    public GroupResponse createGroup(CreateGroupRequest request, Long creatorId) {
        try {
            // Check if group name already exists
            if (groupRepository.existsByName(request.getName())) {
                return new GroupResponse("Group name already exists! Please choose a different name.", false);
            }

            // Find the creator user
            Optional<User> creatorOpt = userRepository.findById(creatorId);
            if (creatorOpt.isEmpty()) {
                return new GroupResponse("User not found!", false);
            }

            User creator = creatorOpt.get();

            // Create new group
            Group group = new Group();
            group.setName(request.getName());
            group.setDescription(request.getDescription());
            group.setCreator(creator);

            // Add creator as a member
            group.addMember(creator);

            // Save group
            Group savedGroup = groupRepository.save(group);

            // Convert to response DTO
            return convertToGroupResponse(savedGroup);

        } catch (Exception e) {
            return new GroupResponse("Could not create group! " + e.getMessage(), false);
        }
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getUserGroups(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return List.of();
        }

        User user = userOpt.get();
        List<Group> groups = groupRepository.findGroupsByCreatorOrMember(user);

        return groups.stream()
                .map(this::convertToGroupResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GroupResponse getGroupById(Long groupId, Long userId) {
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            return new GroupResponse("Group not found!", false);
        }

        Group group = groupOpt.get();

        // Check if user is a member or creator
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return new GroupResponse("User not found!", false);
        }

        User user = userOpt.get();
        if (!group.isMember(user) && !group.isCreator(user)) {
            return new GroupResponse("Access denied! You are not a member of this group.", false);
        }

        return convertToGroupResponse(group);
    }

    public GroupResponse addMemberToGroup(Long groupId, String username, Long currentUserId) {
        try {
            // Find group
            Optional<Group> groupOpt = groupRepository.findById(groupId);
            if (groupOpt.isEmpty()) {
                return new GroupResponse("Group not found!", false);
            }

            Group group = groupOpt.get();

            // Check if current user is the creator
            Optional<User> currentUserOpt = userRepository.findById(currentUserId);
            if (currentUserOpt.isEmpty() || !group.isCreator(currentUserOpt.get())) {
                return new GroupResponse("Only group creator can add members!", false);
            }

            // Find user to add
            Optional<User> userToAddOpt = userRepository.findByUsername(username);
            if (userToAddOpt.isEmpty()) {
                return new GroupResponse("User not found!", false);
            }

            User userToAdd = userToAddOpt.get();

            // Check if user is already a member
            if (group.isMember(userToAdd)) {
                return new GroupResponse("User is already a member of this group!", false);
            }

            // Add member
            group.addMember(userToAdd);
            Group savedGroup = groupRepository.save(group);

            return convertToGroupResponse(savedGroup);

        } catch (Exception e) {
            return new GroupResponse("Could not add member! " + e.getMessage(), false);
        }
    }

    public GroupResponse removeMemberFromGroup(Long groupId, Long userIdToRemove, Long currentUserId) {
        try {
            // Find group
            Optional<Group> groupOpt = groupRepository.findById(groupId);
            if (groupOpt.isEmpty()) {
                return new GroupResponse("Group not found!", false);
            }

            Group group = groupOpt.get();

            // Check if current user is the creator
            Optional<User> currentUserOpt = userRepository.findById(currentUserId);
            if (currentUserOpt.isEmpty() || !group.isCreator(currentUserOpt.get())) {
                return new GroupResponse("Only group creator can remove members!", false);
            }

            // Find user to remove
            Optional<User> userToRemoveOpt = userRepository.findById(userIdToRemove);
            if (userToRemoveOpt.isEmpty()) {
                return new GroupResponse("User not found!", false);
            }

            User userToRemove = userToRemoveOpt.get();

            // Cannot remove creator
            if (group.isCreator(userToRemove)) {
                return new GroupResponse("Cannot remove group creator!", false);
            }

            // Remove member
            group.removeMember(userToRemove);
            Group savedGroup = groupRepository.save(group);

            return convertToGroupResponse(savedGroup);

        } catch (Exception e) {
            return new GroupResponse("Could not remove member! " + e.getMessage(), false);
        }
    }

    @Transactional(readOnly = true)
    public boolean isGroupNameAvailable(String name) {
        return !groupRepository.existsByName(name);
    }

    private GroupResponse convertToGroupResponse(Group group) {
        List<GroupResponse.UserDto> memberDtos = group.getMembers().stream()
                .map(member -> new GroupResponse.UserDto(member.getId(), member.getUsername()))
                .collect(Collectors.toList());

        GroupResponse.UserDto creatorDto = new GroupResponse.UserDto(
                group.getCreator().getId(),
                group.getCreator().getUsername()
        );

        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getCreatedAt(),
                creatorDto,
                memberDtos,
                group.getMembers().size()
        );
    }
}