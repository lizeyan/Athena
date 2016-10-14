from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.user.is_superuser == 1:
            return True

        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the snippet.
        return obj.user == request.user


class AllowPost(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    SAFE_METHODS_LOCAL = ('GET', 'HEAD', 'OPTIONS', 'POST')

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.user.is_superuser == 1:
            return True

        if request.method in permissions.SAFE_METHODS:
            return True

        return False


class IsOwnerOrCanNotGet(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        # Write permissions are only allowed to the owner of the snippet.
        if request.user.is_superuser == 1:
            return True

        if request.method == 'POST' or request.method == 'DELETE':
            return False
        return obj.user == request.user
