<# : batch portion
@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK home dir
@REM
@REM Optional ENV vars
@REM MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to wait at the end of the script
@REM MAVEN_OPTS - parameters to passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM MAVEN_SKIP_RC - flag to disable loading of mavenrc files
@REM ----------------------------------------------------------------------------

@ECHO OFF
@setlocal EnableExtensions EnableDelayedExpansion

IF "%MAVEN_BATCH_ECHO%"=="on" ECHO %MAVEN_BATCH_ECHO%

IF NOT "%MAVEN_SKIP_RC%"=="" GOTO skipRc
IF EXIST "%USERPROFILE%\mavenrc_pre.bat" call "%USERPROFILE%\mavenrc_pre.bat" %*
IF EXIST "%USERPROFILE%\mavenrc_pre.cmd" call "%USERPROFILE%\mavenrc_pre.cmd" %*
:skipRc

IF NOT "%JAVACMD%"=="" goto checkJavacmd
IF NOT "%JAVA_HOME%"=="" goto haveJavaHome

FOR /F "tokens=*" %%i IN ('where java 2^>nul') DO (
    SET "JAVACMD=%%i"
    goto checkJavacmd
)
ECHO The JAVA_HOME environment variable is not defined correctly >&2
ECHO This environment variable is needed to run this program >&2
GOTO error

:haveJavaHome
SET "JAVACMD=%JAVA_HOME%\bin\java.exe"

:checkJavacmd
IF EXIST "%JAVACMD%" GOTO chkMHome
ECHO The JAVA_HOME environment variable is not defined correctly >&2
ECHO This environment variable is needed to run this program >&2
ECHO NB: JAVA_HOME should point to a JDK not a JRE >&2
GOTO error

:chkMHome
SET "MAVEN_PROJECTBASEDIR=%~dp0"
IF "%MAVEN_PROJECTBASEDIR:~-1%"=="\" SET "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

SET "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
SET "WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"

IF EXIST "%WRAPPER_JAR%" GOTO runWrapper

@REM Download wrapper jar if not present
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $webclient = New-Object System.Net.WebClient; $webclient.DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar', '%WRAPPER_JAR%')}"

:runWrapper
SET "JVM_CONFIG_FILE=%MAVEN_PROJECTBASEDIR%\.mvn\jvm.config"
IF NOT EXIST "%JVM_CONFIG_FILE%" GOTO noJvmConfig
FOR /F "usebackq delims=" %%a IN ("%JVM_CONFIG_FILE%") DO (
    SET "JVM_CONFIG_MAVEN_PROPS=!JVM_CONFIG_MAVEN_PROPS! %%a"
)
:noJvmConfig

"%JAVACMD%" ^
  %JVM_CONFIG_MAVEN_PROPS% ^
  %MAVEN_OPTS% ^
  -classpath "%WRAPPER_JAR%" ^
  "-Dmaven.home=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\dists" ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
  org.apache.maven.wrapper.MavenWrapperMain %*
IF ERRORLEVEL 1 GOTO error
GOTO end

:error
SET ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%
exit /B %ERROR_CODE%
