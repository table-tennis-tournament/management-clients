FROM gemini-cli-sandbox

# Install Liberica JDK 25
RUN apt-get update && apt-get install -y wget gnupg software-properties-common \
    && mkdir -p /etc/apt/keyrings \
    && wget -q -O - https://download.bell-sw.com/pki/GPG-KEY-bellsoft | gpg --dearmor -o /etc/apt/keyrings/bellsoft.gpg \
    && echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/bellsoft.gpg] https://apt.bell-sw.com/ stable main" | tee /etc/apt/sources.list.d/bellsoft.list \
    && apt-get update \
    && apt-get install -y bellsoft-java25 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Latest Maven (3.9.12)
ENV MAVEN_VERSION=3.9.12
RUN wget https://dlcdn.apache.org/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz -P /tmp \
    && tar xvf /tmp/apache-maven-${MAVEN_VERSION}-bin.tar.gz -C /opt \
    && ln -s /opt/apache-maven-${MAVEN_VERSION} /opt/maven \
    && rm /tmp/apache-maven-${MAVEN_VERSION}-bin.tar.gz

# Set environment variables for Java and Maven
ENV JAVA_HOME=/usr/lib/jvm/bellsoft-java25-amd64
ENV M2_HOME=/opt/maven
ENV PATH="${M2_HOME}/bin:${JAVA_HOME}/bin:${PATH}"

# Verify installations
RUN java -version && mvn -version
