package org.psk.demo.services;

import org.psk.demo.dto.request.CreateGroupRequest;
import org.psk.demo.dto.response.GroupResponse;
import org.psk.demo.entity.Group;
import org.psk.demo.entity.User;
import org.psk.demo.interceptors.Audited;
import org.psk.demo.interceptors.PerformanceMonitored;
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
@Audited
@PerformanceMonitored(slowThresholdMs = 1500, alwaysLog = false)
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Audited(value = "Create Group", logParameters = true, logReturnValue = true)
    public GroupResponse createGroup(CreateGroupRequest request, Long creatorId) {
        try {
            if (groupRepository.existsByName(request.getName())) {
                return new GroupResponse("Group name already exists! Please choose a different name.", false);
            }

            Optional<User> creatorOpt = userRepository.findById(creatorId);
            if (creatorOpt.isEmpty()) {
                return new GroupResponse("User not found!", false);
            }

            User creator = creatorOpt.get();
            Group group = new Group();
            group.setName(request.getName());
            group.setDescription(request.getDescription());
            group.setCreator(creator);
            group.addMember(creator);

            Group savedGroup = groupRepository.save(group);
            return convertToGroupResponse(savedGroup);

        } catch (Exception e) {
            return new GroupResponse("Could not create group! " + e.getMessage(), false);
        }
    }

    @Audited(value = "Add Member to Group", logParameters = true)
    public GroupResponse addMemberToGroup(Long groupId, String username, Long currentUserId) {
        try {
            Optional<Group> groupOpt = groupRepository.findById(groupId);
            if (groupOpt.isEmpty()) {
                return new GroupResponse("Group not found!", false);
            }

            Group group = groupOpt.get();
            Optional<User> currentUserOpt = userRepository.findById(currentUserId);
            if (currentUserOpt.isEmpty() || !group.isCreator(currentUserOpt.get())) {
                return new GroupResponse("Only group creator can add members!", false);
            }

            Optional<User> userToAddOpt = userRepository.findByUsername(username);
            if (userToAddOpt.isEmpty()) {
                return new GroupResponse("User not found!", false);
            }

            User userToAdd = userToAddOpt.get();
            if (group.isMember(userToAdd)) {
                return new GroupResponse("User is already a member of this group!", false);
            }

            group.addMember(userToAdd);
            Group savedGroup = groupRepository.save(group);
            return convertToGroupResponse(savedGroup);

        } catch (Exception e) {
            return new GroupResponse("Could not add member! " + e.getMessage(), false);
        }
    }

    @Audited(value = "Remove Member from Group", logParameters = true)
    public GroupResponse removeMemberFromGroup(Long groupId, Long userIdToRemove, Long currentUserId) {
        try {
            Optional<Group> groupOpt = groupRepository.findById(groupId);
            if (groupOpt.isEmpty()) {
                return new GroupResponse("Group not found!", false);
            }

            Group group = groupOpt.get();
            Optional<User> currentUserOpt = userRepository.findById(currentUserId);
            if (currentUserOpt.isEmpty() || !group.isCreator(currentUserOpt.get())) {
                return new GroupResponse("Only group creator can remove members!", false);
            }

            Optional<User> userToRemoveOpt = userRepository.findById(userIdToRemove);
            if (userToRemoveOpt.isEmpty()) {
                return new GroupResponse("User not found!", false);
            }

            User userToRemove = userToRemoveOpt.get();
            if (group.isCreator(userToRemove)) {
                return new GroupResponse("Cannot remove group creator!", false);
            }

            group.removeMember(userToRemove);
            Group savedGroup = groupRepository.save(group);
            return convertToGroupResponse(savedGroup);

        } catch (Exception e) {
            return new GroupResponse("Could not remove member! " + e.getMessage(), false);
        }
    }

    @Audited(value = "Delete Group", logParameters = true)
    public GroupResponse deleteGroup(Long groupId, Long currentUserId) {
        try {
            Optional<Group> groupOpt = groupRepository.findById(groupId);
            if (groupOpt.isEmpty()) {
                return new GroupResponse("Group not found!", false);
            }

            Group group = groupOpt.get();
            Optional<User> currentUserOpt = userRepository.findById(currentUserId);
            if (currentUserOpt.isEmpty() || !group.isCreator(currentUserOpt.get())) {
                return new GroupResponse("Only group creator can delete the group!", false);
            }

            String groupName = group.getName();
            groupRepository.delete(group);
            return new GroupResponse("Group '" + groupName + "' deleted successfully!", true);

        } catch (Exception e) {
            return new GroupResponse("Could not delete group! " + e.getMessage(), false);
        }
    }

    @Transactional(readOnly = true)
    @PerformanceMonitored(slowThresholdMs = 500) // Lower threshold for read operations
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
    @PerformanceMonitored(slowThresholdMs = 300)
    public GroupResponse getGroupById(Long groupId, Long userId) {
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            return new GroupResponse("Group not found!", false);
        }

        Group group = groupOpt.get();
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