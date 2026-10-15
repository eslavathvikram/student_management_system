# 03 – Deployment on Amazon EC2 (Step 5, Platform 1)

## 1. Launch the instance (AWS Console → EC2 → Launch instance)
| Setting | Value |
|---|---|
| Name | `sms-aws` |
| AMI | Ubuntu Server 24.04 LTS (64-bit x86) |
| Instance type | `t3.micro` (2 vCPU, 1 GiB) – or `t2.micro`/free-tier eligible type shown in your account |
| Key pair | Create new `sms-key` (.pem) – keep it safe |
| Network | Default VPC, **auto-assign public IP: enable** |
| Storage | 20 GiB gp3 |
| Security group `sms-sg` | Inbound: SSH 22 (**My IP**), Custom TCP 3000 (0.0.0.0/0), optional HTTP 80 |

> 1 GiB RAM is tight for MySQL. If MySQL is killed (OOM), add swap:
> `sudo fallocate -l 1G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`

## 2. Connect and deploy
```bash
chmod 400 sms-key.pem
scp -i sms-key.pem student-management-system.zip ubuntu@<EC2-PUBLIC-IP>:~/
ssh -i sms-key.pem ubuntu@<EC2-PUBLIC-IP>
sudo apt install -y unzip && unzip student-management-system.zip && cd student-management-system
sudo bash deployment/setup_vm.sh
```
(Note: `ufw` is the OS firewall; the **Security Group** is the cloud firewall. Both must allow port 3000.)

## 3. Test
```bash
curl http://localhost:3000/api/health
```
Browser: `http://<EC2-PUBLIC-IP>:3000` → perform Add / View / Update / Delete.

## 4. Record
| Item | Value |
|---|---|
| Region / AZ | ‹ap-south-1 (Mumbai)› |
| Instance ID | ‹i-…› |
| Public IP | ‹…› |
| Time to launch → running | ‹…› |
| Time to run setup script | ‹…› |
| CRUD verified via public IP | ‹✔› |

## 5. Clean-up (avoid charges!)
Stop/terminate instance, release any Elastic IP, delete unused volumes. Set a **billing alarm / budget** before starting.
