# ROS VSCode Extension

This [Visual Studio Code (VSCode)][vscode] extension provides support for [Robot Operating System (ROS)][ros]
development.

* [Repository][repo]
* [Issues][issues]

## Getting Started

The extension will automatically start when you open a catkin workspace.
The build system (e.g. catkin_make or catkin build) will automatically be confirmed from the hidden files associated with
each system.
The ROS distro will automatically be confirmed from the parent environment, or you will be prompted to select a ROS
distro if this can't be done automatically.

> You must build the catkin workspace at least once before the extension will recognise it.

To start ROS master, use the "ROS: Start Core" command. The "ROS master" indicator in the bottom left will show if the
master is currently running, and you can click on this to view parameters etc. If you hit F5 you can create a debug
configuration to run a `rosrun` or `roslaunch` command.

The first time you open the workspace the extension will automatically create build and test tasks and update the
C++ and Python paths. You can re-run this process later using the appropriate commands.

## Features

* Automatic ROS environment configuration.
* Allows starting, stopping and viewing the ROS master status.
* Automatically discover `catkin_make` or `catkin build` build tasks.
* Create catkin packages using `catkin_create_pkg` script or `catkin create pkg`.
* Run `rosrun` or `roslaunch` (breakpoints currently not supported).
* Syntax highlighting for `.msg`, `.urdf` and other ROS files.
* Automatically add the ROS C++ include and Python import paths.
* Format C++ using the ROS `clang-format` style.

## Commands

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Command</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Create Catkin Package</td>
      <td><code>ros.createCatkinPackage</code></td>
      <td>
        Create a catkin package. You can right click on a folder in the explorer to create it in a specific location.
      </td>
    </tr>
    <tr>
      <td>Create Terminal</td>
      <td><code>ros.createTerminal</code></td>
      <td>Create a terminal with ROS sourced.</td>
    </tr>
    <tr>
      <td>Show Master Status</td>
      <td><code>ros.showMasterStatus</code></td>
      <td>Open a detail view showing details about the ROS master.</td>
    </tr>
    <tr>
      <td>Start Core</td>
      <td><code>ros.startCore</code></td>
      <td>Spawn a ROS core</td>
    </tr>
    <tr>
      <td>Stop Core</td>
      <td><code>ros.stopCore</code></td>
      <td>Kill the ROS core</td>
    </tr>
    <tr>
      <td>Update C++ Properties</td>
      <td><code>ros.updateCppProperties</code></td>
      <td>Update the C++ include path to include ROS.</td>
    </tr>
    <tr>
      <td>Update Python Path</td>
      <td><code>ros.updatePythonPath</code></td>
      <td>Update the Python path to include ROS.</td>
    </tr>
  </tbody>
</table>

[issues]: https://github.com/ajshort/vscode-ros/issues
[repo]: https://github.com/ajshort/vscode-ros
[ros]: http://ros.org
[vscode]: https://code.visualstudio.com
