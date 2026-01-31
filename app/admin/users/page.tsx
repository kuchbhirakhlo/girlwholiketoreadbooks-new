'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { getDbInstance, isFirebaseConfigured } from '@/lib/firebase';
import { Users, Search, UserCog, Mail, Shield, Calendar, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'reader';
  status: 'active' | 'disabled';
  createdAt: any;
  postsCount?: number;
}

const roleLabels: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700' },
  editor: { label: 'Editor', color: 'bg-blue-100 text-blue-700' },
  reader: { label: 'Reader', color: 'bg-gray-100 text-gray-600' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  disabled: { label: 'Disabled', color: 'bg-red-100 text-red-700' },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isFirebaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const dbInstance = await getDbInstance();
        if (!dbInstance) return;

        // Fetch users
        const usersQuery = query(
          collection(dbInstance, 'users'),
          orderBy('createdAt', 'desc')
        );
        const usersSnapshot = await getDocs(usersQuery);

        // Fetch posts count per user
        const postsSnapshot = await getDocs(collection(dbInstance, 'posts'));
        const postsByUser: Record<string, number> = {};
        postsSnapshot.docs.forEach(doc => {
          const authorId = doc.data().authorId;
          if (authorId) {
            postsByUser[authorId] = (postsByUser[authorId] || 0) + 1;
          }
        });

        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          postsCount: postsByUser[doc.id] || 0,
        })) as User[];

        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    setSaving(userId);
    try {
      const dbInstance = await getDbInstance();
      if (!dbInstance) return;

      await updateDoc(doc(dbInstance, 'users', userId), {
        role: newRole,
        updatedAt: new Date(),
      });

      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole as User['role'] } : u
      ));
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update role. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const action = newStatus === 'active' ? 'enable' : 'disable';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    setSaving(userId);
    try {
      const dbInstance = await getDbInstance();
      if (!dbInstance) return;

      await updateDoc(doc(dbInstance, 'users', userId), {
        status: newStatus,
        updatedAt: new Date(),
      });

      setUsers(users.map(u => 
        u.id === userId ? { ...u, status: newStatus as User['status'] } : u
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (name: string, email: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return email.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-[#6F6F6F]">
          <div className="w-6 h-6 border-2 border-[#8B5E3C]/30 border-t-[#8B5E3C] rounded-full animate-spin" />
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#2B2B2B]">Users</h1>
        <p className="text-[#6F6F6F] mt-1">Manage user roles and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white border-[#E6E1DA] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-[#6F6F6F]">Admins</p>
              <p className="text-2xl font-bold text-[#2B2B2B]">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-white border-[#E6E1DA] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserCog className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[#6F6F6F]">Editors</p>
              <p className="text-2xl font-bold text-[#2B2B2B]">
                {users.filter(u => u.role === 'editor').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-white border-[#E6E1DA] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-[#6F6F6F]">Total Users</p>
              <p className="text-2xl font-bold text-[#2B2B2B]">{users.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-white border-[#E6E1DA]">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F6F6F]" />
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-[#E6E1DA] focus:border-[#8B5E3C]"
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="bg-white border-[#E6E1DA] overflow-hidden">
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E6E1DA] bg-[#FAF8F5]">
                  <th className="text-left px-6 py-3 text-sm font-medium text-[#6F6F6F]">User</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-[#6F6F6F] hidden md:table-cell">Role</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-[#6F6F6F] hidden lg:table-cell">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-[#6F6F6F] hidden sm:table-cell">Posts</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-[#6F6F6F] hidden lg:table-cell">Joined</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-[#6F6F6F]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1DA]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 bg-[#8B5E3C]">
                          <AvatarFallback className="text-white text-sm font-medium">
                            {getInitials(user.name || '', user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-[#2B2B2B]">{user.name || 'Unnamed'}</p>
                          <p className="text-sm text-[#6F6F6F] flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                        disabled={saving === user.id || user.role === 'admin'}
                      >
                        <SelectTrigger className={`w-28 ${roleLabels[user.role]?.color} border-0`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reader">Reader</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusLabels[user.status || 'active']?.color}`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-[#6F6F6F]">{user.postsCount || 0}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-sm text-[#6F6F6F]">
                        <Calendar className="w-3 h-3" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {user.status !== 'disabled' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(user.id, 'disabled')}
                            disabled={saving === user.id || user.role === 'admin'}
                            className="text-red-500 hover:bg-red-50 text-xs"
                          >
                            Disable
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(user.id, 'active')}
                            disabled={saving === user.id}
                            className="text-green-600 hover:bg-green-50 text-xs"
                          >
                            Enable
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-[#E6E1DA]" />
            <h3 className="text-lg font-medium text-[#2B2B2B] mb-1">No users found</h3>
            <p className="text-[#6F6F6F]">
              {search ? 'Try adjusting your search' : 'Users will appear here once they sign up'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
