import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar.jsx";
import user from "../icons/user.svg";
import "../css/settings.css";
import Notification from './modals/notification/notification';
import LogoutModal from './modals/logout/logout.jsx';
function Setting() {
    const [businessProfile, setBusinessProfile] = useState({
        business_name: '',
        email: '',
        contact_number: '',
        address: '',
        logo: '',
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', userType: 'CASHIER', password: '', confirmPassword: '' });
    const [editUser, setEditUser] = useState({ index: null, userId: null, username: '', userType: 'CASHIER', password: '', confirmPassword: '' });
    const [userError, setUserError] = useState('');
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [deleteUser, setDeleteUser] = useState({ userId: null, username: '' });
    const role = sessionStorage.getItem("role") || localStorage.getItem("role");
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        fetchBusinessProfile();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = sessionStorage.getItem('accessToken');
            const res = await axios.get('http://localhost:8081/users/users', {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data || []);
            console.log('Fetched users:', res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {   
        fetchUsers();
    }, []);

    const fetchBusinessProfile = async () => {
        try {
            const token = sessionStorage.getItem('accessToken');
            const res = await axios.get('http://localhost:8081/business-profile', {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data) {
                setBusinessProfile({
                    business_name: res.data.business_name || '',
                    email: res.data.email || '',
                    contact_number: res.data.contact_number || '',
                    address: res.data.address || '',
                    logo: res.data.logo || '',
                });
                if (res.data.logo) {
                    setLogoPreview(`http://localhost:8081/${res.data.logo}`);
                }
            }
        } catch (error) {
            console.error('Error fetching business profile:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setBusinessProfile((prev) => ({ ...prev, [field]: value }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            setMessage('');
            const token = sessionStorage.getItem('accessToken');
            
            const formData = new FormData();
            formData.append('business_name', businessProfile.business_name);
            formData.append('email', businessProfile.email);
            formData.append('contact_number', businessProfile.contact_number);
            formData.append('address', businessProfile.address);
            if (logoFile) {
                formData.append('logo', logoFile);
            }

            const res = await axios.put('http://localhost:8081/business-profile', formData, {
                withCredentials: true,
                headers: { 
                    Authorization: `Bearer ${token}`,
                },
            });
            
            setBusinessProfile((prev) => ({ ...prev, logo: res.data.logo }));
            setLogoFile(null);
            setMessage('Business profile saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error saving business profile:', error);
            setMessage(error.response?.data?.error || 'Failed to save business profile');
        } finally {
            setLoading(false);
        }
    }

    const openAddUserModal = () => {
        setUserError('');
        setNewUser({ username: '', userType: 'CASHIER', password: '', confirmPassword: '' });
        setShowAddUserModal(true);
    };

    const closeAddUserModal = () => {
        setShowAddUserModal(false);
    };

    const openEditUserModal = (idx) => {
        const target = users[idx];
        setUserError('');
        setEditUser({
            index: idx,
            userId: target.userId,
            username: target.username,
            userType: target.userType,
            password: '',
            confirmPassword: '',
        });
        setShowEditUserModal(true);
    };

    const closeEditUserModal = () => {
        setShowEditUserModal(false);
    };

    const handleAddUser = async () => {
    const trimmedUsername = newUser.username.trim();
    const trimmedPassword = newUser.password.trim();

    if (!trimmedUsername) {
        setUserError('Username is required');
        return;
    }

    if (!trimmedPassword) {
        setUserError('Password is required');
        return;
    }

    if (trimmedPassword !== newUser.confirmPassword.trim()) {
        setUserError('Passwords do not match');
        return;
    }

    try {
        const token = sessionStorage.getItem('accessToken');
        await axios.post('http://localhost:8081/users/user', {
            username: trimmedUsername,
            userType: newUser.userType,
            password: trimmedPassword,
            confirmPassword: newUser.confirmPassword.trim()
        }, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
        });
        
        await fetchUsers(); // Refresh the user list
        setShowAddUserModal(false);
        setUserError('');
    } catch (error) {
        console.error('Error adding user:', error);
        setUserError(error.response?.data?.error || 'Failed to add user');
    }
};

    const handleSaveEditUser = async () => {
        const trimmedUserName = editUser.username.trim();
        const trimmedPassword = editUser.password.trim();

        if (!trimmedUserName) {
            setUserError('Username is required');
            return;
        }

        if (trimmedPassword && trimmedPassword !== editUser.confirmPassword.trim()) {
            setUserError('Passwords do not match');
            return;
        }

        try {
        const token = sessionStorage.getItem('accessToken');
        const payload = {
            username: trimmedUserName,
            userType: editUser.userType,
        };
        
        if (trimmedPassword) {
            payload.password = trimmedPassword;
        }

        await axios.put(`http://localhost:8081/users/user/${editUser.userId}`, payload, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
        });

        await fetchUsers(); // Refresh the user list
        setShowEditUserModal(false);
        setUserError('');
    } catch (error) {
        console.error('Error updating user:', error);
        setUserError(error.response?.data?.error || 'Failed to update user');
    }
    };

    const openDeleteUserModal = (idx) => {
    const target = users[idx];
    setDeleteUser({ userId: target.userId, username: target.username });
    setShowDeleteUserModal(true);
};

const closeDeleteUserModal = () => {
    setShowDeleteUserModal(false);
    setDeleteUser({ userId: null, username: '' });
};

    const handleConfirmDeleteUser = async () => {
    if (!deleteUser.userId) return;
    try {
        const token = sessionStorage.getItem('accessToken');
        await axios.delete(`http://localhost:8081/users/user/${deleteUser.userId}`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
        });
        await fetchUsers();
        closeDeleteUserModal();
    } catch (error) {
        console.error('Error deleting user:', error);
    }
};

   

    return (
        <div className="settings">
            <Sidebar />

            <div className="dashboard-content">
                <header>
                    <h2>SETTINGS</h2>
                    <div className="inventory-account">
            <Notification /> 

            <button onClick={() => setShowLogoutModal(true)}
            
              className="inventory-user-btn">
            <img src={user} alt="Admin Icon"/>
            
            <p>{role}</p>
            </button>
          </div>

                </header>

                <div className="settings-main-content">
                    <section className="business-card">
                        <div className="card-head">
                            <h1>Business Profile</h1>
                            <p>Manage your clinic information and branding</p>
                        </div>

                        <div className="business-grid">
                            <div className="upload-box">
                                {logoPreview ? (
                                    <div className="logo-preview">
                                        <img src={logoPreview} alt="Logo Preview" />
                                        <label className="change-logo-label">
                                            <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                                            Change
                                        </label>
                                    </div>
                                ) : (
                                    <label className="upload-area">
                                        <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                                        <span>Click to upload</span>
                                        <small>PNG, JPG up to 5MB</small>
                                    </label>
                                )}
                            </div>

                            <div className="business-form">
                                <div className="form-row">
                                    <label>Clinic Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter clinic name"
                                        value={businessProfile.business_name}
                                        onChange={(e) => handleInputChange('business_name', e.target.value)}
                                    />
                                </div>

                                <div className="form-row two">
                                    <div>
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="name@email.com"
                                            value={businessProfile.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label>Contact Number</label>
                                        <input
                                            type="text"
                                            placeholder="09xxxxxxxxx"
                                            value={businessProfile.contact_number}
                                            onChange={(e) => handleInputChange('contact_number', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        placeholder="Street, City, Province"
                                        value={businessProfile.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="business-actions">
                            <div>
                                {message && <p className="message">{message}</p>}
                            </div>
                            <button className="btn primary" onClick={handleSaveProfile} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Business Profile'}
                            </button>
                        </div>
                    </section>

                    <section className="user-card">
                        <div className="card-head user-head">
                            <div>
                                <h1>User Management</h1>
                                <p>Manage team members</p>
                            </div>
                            <button className="btn primary" onClick={openAddUserModal}>Add User</button>
                        </div>

                        <div className="table-wrap">
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u, idx) => (
                                        <tr key={`${u.username}-${u.userId}`}>
                                            <td>{u.username}</td>
                                            <td>{u.userType}</td>
                                            <td className="actions-cell">
                                                <button className="link" onClick={() => openEditUserModal(idx)}>Edit</button>
                                                <button className="link danger" onClick={() => openDeleteUserModal(idx)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    
                </div>

                {showAddUserModal && (
                    <div className="modal-backdrop" onClick={closeAddUserModal}>
                        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Add User</h3>
                                <button className="close-btn" onClick={closeAddUserModal}>×</button>
                            </div>
                            <div className="modal-body">
                                <label>Username</label>
                                <input
                                    type="text"
                                    placeholder="Enter Username"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser((prev) => ({ ...prev, username: e.target.value }))}
                                />

                                <label>Role</label>
                                <select
                                    value={newUser.userType}
                                    onChange={(e) => setNewUser((prev) => ({ ...prev, userType: e.target.value }))}
                                >

                                    <option value="CASHIER">Cashier</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="ADMIN">Admin</option>

                                </select>

                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                                />

                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="Re-enter password"
                                    value={newUser.confirmPassword}
                                    onChange={(e) => setNewUser((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                />

                                {userError && <p className="error-text">{userError}</p>}
                            </div>
                            <div className="modal-actions">
                                <button className="btn secondary" onClick={closeAddUserModal}>Cancel</button>
                                <button className="btn primary" onClick={handleAddUser}>Add User</button>
                            </div>
                        </div>
                    </div>
                )}

                {showEditUserModal && (
                    <div className="modal-backdrop" onClick={closeEditUserModal}>
                        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Edit User</h3>
                                <button className="close-btn" onClick={closeEditUserModal}>×</button>
                            </div>
                            <div className="modal-body">
                                <label>Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={editUser.username}
                                    onChange={(e) => setEditUser((prev) => ({ ...prev, username: e.target.value }))}
                                />

                                <label>Role</label>
                                <select
                                    value={editUser.userType}
                                    onChange={(e) => setEditUser((prev) => ({ ...prev, userType: e.target.value }))}
                                >
                                    <option value="Administrator">Administrator</option>
                                    <option value="Staff">Staff</option>
                                    <option value="Cashier">Cashier</option>
                                    <option value="ceo">CEO</option>
                                </select>

                                <label>New Password (optional)</label>
                                <input
                                    type="password"
                                    placeholder="Leave blank to keep current"
                                    value={editUser.password}
                                    onChange={(e) => setEditUser((prev) => ({ ...prev, password: e.target.value }))}
                                />

                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    placeholder="Re-enter new password"
                                    value={editUser.confirmPassword}
                                    onChange={(e) => setEditUser((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                />

                                {userError && <p className="error-text">{userError}</p>}
                            </div>
                            <div className="modal-actions">
                                <button className="btn secondary" onClick={closeEditUserModal}>Cancel</button>
                                <button className="btn primary" onClick={handleSaveEditUser}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}

                {showLogoutModal && (
                <LogoutModal
                  open={showLogoutModal}
                  onCancel={() => setShowLogoutModal(false)}
                  onConfirm={() => {
                    sessionStorage.clear();
                    window.location.href = "/";
                  }}
                />
              )}

                {showDeleteUserModal && (
    <div className="modal-backdrop" onClick={closeDeleteUserModal}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h3>Delete User</h3>
                <button className="close-btn" onClick={closeDeleteUserModal}>×</button>
            </div>
            <div className="modal-body delete-body">
                <p className="delete-text">
                    Are you sure you want to delete <h1 className="delete-username">{deleteUser.username}</h1>?
                </p>
                <p className="delete-note">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
                <button className="btn secondary" onClick={closeDeleteUserModal}>Cancel</button>
                <button className="btn danger" onClick={handleConfirmDeleteUser}>Delete</button>
            </div>
        </div>
    </div>
)}


            </div>
        </div>
    );
}

export default Setting;