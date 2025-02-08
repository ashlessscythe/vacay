# Install curl and ca-certificates (if not already installed)
sudo pacman -Sy --noconfirm curl ca-certificates 

# Install PostgreSQL 16
yay -S --noconfirm postgresql

# Initialize and start PostgreSQL service
sudo systemctl enable --now postgresql

# Initialize database (if not already initialized)
sudo -iu postgres initdb --locale en_US.UTF-8 -D /var/lib/postgres/data

# Start PostgreSQL service
sudo systemctl start postgresql

# Optionally, set up a PostgreSQL user and database
# sudo -iu postgres createuser --interactive
# sudo -iu postgres createdb mydatabase
