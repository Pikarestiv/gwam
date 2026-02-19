#!/bin/bash
set -e

echo "🚀 Gwam Deployment Secrets Setup"
echo "This script will help you generate the necessary keys and secrets for GitHub Actions."
echo ""

# Check for gh CLI
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI (gh) tool not found."
    echo "You will need to manually add secrets in your repository settings: Settings > Secrets and variables > Actions"
    HAS_GH=false
else
    echo "✅ GitHub CLI (gh) found."
    HAS_GH=true
fi

echo ""
echo "--- 1. SSH Key Generation (for Backend Deployment) ---"
KEY_Name="id_rsa_gwam_deploy"
if [ -f "$KEY_Name" ]; then
    echo "ℹ️  SSH key '$KEY_Name' already exists. Skipping generation."
else
    ssh-keygen -t rsa -b 4096 -C "deploy@gwam" -f "$KEY_Name" -N ""
    echo "✅ Generated SSH key pair: $KEY_Name"
fi

echo ""
echo "IMPORTANT: Copy the public key below and add it to your server's ~/.ssh/authorized_keys file:"
echo "--------------------------------------------------------------------------------"
cat "${KEY_Name}.pub"
echo "--------------------------------------------------------------------------------"
echo ""

read -p "Press Enter once you have added the public key to your server..."

# Configuration Prompts
echo ""
echo "--- 2. Enter Deployment Credentials ---"

read -p "Enter SSH_HOST (e.g., api.gwam.dumostech.com): " SSH_HOST
read -p "Enter SSH_USER (e.g., your-server-user): " SSH_USER
echo "Using generated private key for SSH_PRIVATE_KEY..."

echo ""
echo "--- 3. Enter FTP Credentials (for Frontend/Admin/Landing) ---"
read -p "Enter FTP_SERVER (e.g., server.namecheap.com): " FTP_SERVER
read -p "Enter FTP_USERNAME: " FTP_USERNAME
read -s -p "Enter FTP_PASSWORD: " FTP_PASSWORD
echo ""

# GitHub Secrets Update
if [ "$HAS_GH" = true ]; then
    echo ""
    echo "--- 4. Updating GitHub Secrets ---"
    
    gh secret set SSH_HOST --body "$SSH_HOST"
    gh secret set SSH_USER --body "$SSH_USER"
    gh secret set SSH_PRIVATE_KEY < "$KEY_Name"
    
    gh secret set FTP_SERVER --body "$FTP_SERVER"
    gh secret set FTP_USERNAME --body "$FTP_USERNAME"
    gh secret set FTP_PASSWORD --body "$FTP_PASSWORD"
    
    echo "✅ Secrets successfully pushed to GitHub!"
else
    echo ""
    echo "--- 4. Manual GitHub Secrets Setup ---"
    echo "Please add the following secrets to your repository:"
    echo ""
    echo "SSH_HOST: $SSH_HOST"
    echo "SSH_USER: $SSH_USER"
    echo "SSH_PRIVATE_KEY:"
    echo "(Copy the contents of $KEY_Name)"
    echo ""
    echo "FTP_SERVER: $FTP_SERVER"
    echo "FTP_USERNAME: $FTP_USERNAME"
    echo "FTP_PASSWORD: (hidden)"
fi

echo ""
echo "🎉 Setup Complete! Your next push to main will trigger deployment."
