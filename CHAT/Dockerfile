FROM node:10

# Create app directory
# WORKDIR /usr/src/app 

WORKDIR /Users/hero/Code/DOCKER

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production



# Bundle app source
COPY . .


## Your app binds to port 8080 
## so you'll use the EXPOSE instruction to have it mapped by the docker daemon:
EXPOSE 3000


CMD [ "node", "index.js" ]



# Building your image
# Go to the directory that has your Dockerfile and run the following command to build the Docker image. The -t flag lets you tag your image so it's easier to find later using the docker images command:

# docker build -t <your username>/node-web-app .
# docker build --rm -f Dockerfile -t ebudezain:v.0.1.0 .
# Your image will now be listed by Docker:

# $ docker images

# # Example
# REPOSITORY                      TAG        ID              CREATED
# node                            10         1934b0b038d1    5 days ago
# <your username>/node-web-app    latest     d64d3505b0d2    1 minute ago
# Run the image
# Running your image with -d runs the container in detached mode, leaving the container running in the background. The -p flag redirects a public port to a private port inside the container. Run the image you previously built:

# docker run -p 49160:8080 -d <your username>/node-web-app
# Print the output of your app:

# # Get container ID
# $ docker ps

# # Print app output
# $ docker logs <container id>

# # Example
# Running on http://localhost:8080
# If you need to go inside the container you can use the exec command:

# # Enter the container
# $ docker exec -it <container id> /bin/bash



# Tạo Dockerfile
# Để xây dựng một Docker Image thì bạn cần tạo một Dockerfile, nó là một file text với các instruction và các tham số. Sau đây là miêu tả của các instruction chúng ta sẽ sử dụng ở ví dụ sau đây.

# FROM — Thiết lập image gốc, tạo một image dựa trên một image nào đấy ví dụ centos, nginx..
# RUN — Chạy các câu lệnh trong Container
# ENV — thiết lập biến môi trường
# WORKDIR — thiết lập thư mục đang hoạt động trên đấy
# VOLUME — tạo mount-point cho một volume
# CMD — thiết lập các thực thi cho Container
# Để hiểu rõ và chi tiết hơn bạn có thể xem ở đây

# Chúng ta tạo một Image dùng để lấy nội dụng của trang web dựa theo đường dẫn và lưu nó vào trong file text. Chúng ta cần truyền đường dẫn của trang web thông qua biến môi trường SITE_URL. File kết qủa sẽ được đặt trong thư mục mà được mouned như một volume

# Đặt file Dockerfile trong thư mục  examples/curl với nội dung như sau

# FROM ubuntu:latest  
# RUN apt-get update \  
#     && apt-get install --no-install-recommends --no-install-suggests -y curl \
#     && rm -rf /var/lib/apt/lists/*
# ENV SITE_URL http://example.com/  
# WORKDIR /data  
# VOLUME /data  
# CMD sh -c "curl -Lk $SITE_URL > /data/results"

# FROM ubuntu:latest  
# RUN apt-get update \  
#     && apt-get install --no-install-recommends --no-install-suggests -y curl \
#     && rm -rf /var/lib/apt/lists/*
# ENV SITE_URL http://example.com/  
# WORKDIR /data  
# VOLUME /data  
# CMD sh -c "curl -Lk $SITE_URL > /data/results"
# Dockerfile đã sẵn sàng. Giờ là lúc thử build một Image thực tế

# Nào hãy chuyển đến thư mục examples/curl và chạy câu lệnh build Image như sau:

# docker build . -t test-curl
# 1
# docker build . -t test-curl
