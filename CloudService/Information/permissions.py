from rest_framework import permissions


class ActivityGroupPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser == 1:
            return True

        user_status = 0
        profile = request.user.profile
        admin = profile.admin_activity_group.filter(id=obj.id)
        normal = profile.normal_activity_group.filter(id=obj.id)
        if admin.count() != 0:
            user_status = 2
        elif normal.count() != 0:
            user_status = 1
        else:
            user_status = 0

        if user_status == 0:
            return False

        if request.method in permissions.SAFE_METHODS:
            return True
        else:
            if user_status == 1:
                return False
            else:
                return True


class ActivityPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser == 1:
            return True

        activity_group = obj.activity_group
        admin_group_set = request.user.profile.admin_activity_group.filter(id=activity_group.id)
        if admin_group_set.count() != 0:
            return True

        if request.method in permissions.SAFE_METHODS and request.user.profile.is_term_camera:
            return True
        return False


class RegisterLogPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser == 1:
            return True

        if request.method in permissions.SAFE_METHODS:
            return True
