-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-11-2024 a las 18:30:47
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sistemacitas`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `mostrar_citas_dia` ()   BEGIN
    -- Obtener todas las citas del día actual
    SELECT c.Cita_ID, cl.Nombre, cl.Apellido_Paterno, s.Nombre AS Servicio, c.Fecha, c.Hora, c.Estado
    FROM citas c
    JOIN clientes cl ON c.Cliente_ID = cl.Cliente_ID
    JOIN servicios s ON c.Servicio_ID = s.Servicio_ID
    WHERE c.Fecha = CURDATE();
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `mostrar_citas_proximas` ()   BEGIN
  SELECT c.Cita_ID, cl.Nombre, cl.Apellido_Paterno, s.Nombre AS Servicio, c.Fecha, c.Hora, c.Estado
    FROM citas c
    JOIN clientes cl ON c.Cliente_ID = cl.Cliente_ID
    JOIN servicios s ON c.Servicio_ID = s.Servicio_ID
    WHERE c.Fecha > CURDATE()
    ORDER BY c.Fecha, c.Hora;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `obtener_citas_por_fecha` (IN `fecha` DATE)   BEGIN
    SELECT c.Cita_ID, cl.Nombre, cl.Apellido_Paterno, s.Nombre AS Servicio, c.Fecha, c.Hora, c.Estado
    FROM citas c
    JOIN clientes cl ON c.Cliente_ID = cl.Cliente_ID -- Usar Cliente_ID para la unión
    JOIN servicios s ON c.Servicio_ID = s.Servicio_ID -- Asegurarse de unir con la tabla de servicios
    WHERE c.Fecha = fecha; -- Filtrar por la fecha exacta
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas`
--

CREATE TABLE `citas` (
  `Cita_ID` int(11) NOT NULL,
  `Cliente_ID` int(11) DEFAULT NULL,
  `Servicio_ID` int(11) DEFAULT NULL,
  `Fecha` date DEFAULT NULL,
  `Hora` time DEFAULT NULL,
  `Estado` enum('pendiente','realizada') DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `citas`
--

INSERT INTO `citas` (`Cita_ID`, `Cliente_ID`, `Servicio_ID`, `Fecha`, `Hora`, `Estado`) VALUES
(3, 2, 1, '2024-10-26', '20:33:28', 'pendiente'),
(4, 2, 1, '2024-10-20', '17:38:20', 'pendiente'),
(5, 3, 1, '2024-10-21', '10:18:44', 'pendiente'),
(12, 2, 1, '2024-10-29', '00:08:00', 'pendiente'),
(18, 2, 1, '0000-00-00', '00:00:00', 'pendiente'),
(21, 2, 1, '2024-10-30', '08:24:00', 'pendiente'),
(22, 3, 1, '2024-10-30', '00:27:00', 'pendiente'),
(32, 2, 1, '2024-11-01', '19:36:00', 'pendiente'),
(33, 2, 1, '2024-11-01', '21:48:00', 'pendiente'),
(38, 2, 1, '2024-10-31', '19:38:00', 'pendiente'),
(39, 2, 1, '2024-10-31', '19:40:00', 'pendiente'),
(40, 2, 1, '2024-10-31', '21:38:00', 'pendiente'),
(43, 2, 1, '2024-11-01', '19:38:00', 'pendiente'),
(46, 2, 1, '2024-11-02', '09:47:00', 'pendiente'),
(47, 2, 8, '2024-11-04', '15:10:00', 'pendiente'),
(50, 2, 8, '2024-11-04', '13:15:00', 'pendiente'),
(51, 2, 1, '2024-11-05', '12:15:00', 'pendiente'),
(52, 2, 1, '2024-11-04', '12:15:00', 'pendiente'),
(53, 3, 1, '2024-11-04', '12:15:00', 'pendiente'),
(54, 3, 1, '2024-11-04', '12:15:00', 'pendiente'),
(55, 7, 8, '2024-11-04', '12:16:00', 'pendiente'),
(56, 2, 1, '2024-11-04', '12:17:00', 'pendiente'),
(57, 2, 1, '0000-00-00', '00:00:00', 'realizada'),
(60, 3, 8, '2024-11-13', '22:21:00', 'pendiente'),
(61, 2, 1, '2024-11-14', '08:47:00', 'pendiente'),
(62, 7, 1, '2024-11-16', '17:16:00', 'realizada'),
(65, 2, 1, '2024-11-19', '23:19:00', 'pendiente'),
(66, 2, 1, '2024-11-19', '12:32:00', 'pendiente'),
(67, 2, 1, '2024-11-18', '23:51:00', 'pendiente'),
(68, 9, 20, '2024-11-18', '20:57:00', 'pendiente'),
(71, 2, 8, '2024-11-26', '08:40:00', 'pendiente'),
(73, 2, 1, '2024-11-27', '08:40:00', 'pendiente');

--
-- Disparadores `citas`
--
DELIMITER $$
CREATE TRIGGER `evitar_solapamiento_citas` BEFORE INSERT ON `citas` FOR EACH ROW BEGIN
    DECLARE solapamiento INT;
    SELECT COUNT(*)
    INTO solapamiento
    FROM citas
    WHERE Fecha = NEW.Fecha
      AND ABS(TIME_TO_SEC(TIMEDIFF(Hora, NEW.Hora))) <= 900; -- 900 segundos = 15 minutos

    -- Si hay solapamiento, lanza un error
    IF solapamiento > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ya existe una cita programada dentro del rango de 15 minutos.';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `Cliente_ID` int(11) NOT NULL,
  `Nombre` varchar(50) DEFAULT NULL,
  `Apellido_Paterno` varchar(50) DEFAULT NULL,
  `Apellido_Materno` varchar(50) DEFAULT NULL,
  `Tel` varchar(15) DEFAULT NULL,
  `Direccion` varchar(100) DEFAULT NULL,
  `activo` enum('si','no') NOT NULL DEFAULT 'si'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`Cliente_ID`, `Nombre`, `Apellido_Paterno`, `Apellido_Materno`, `Tel`, `Direccion`, `activo`) VALUES
(2, 'Jony', 'Man', 'Rim', '6182292002', 'Loco333', 'si'),
(3, 'Angel', 'Avitia', 'Ramirez', '6182929482', 'UTDburrote', 'si'),
(7, 'Javier', 'Sandoval ', 'Sanchez', '61812929283', 'Near de la 8999', 'no'),
(9, 'Prueba', 'Probador', 'pru', '1234', 'kk', 'no'),
(11, 'sdsf', 'wd', 'wdf', '5558', 'Cerca de la 89', 'si'),
(12, 'dd', 'w', 'efwew', 'ee', 'UTDburrote', 'no');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados`
--

CREATE TABLE `empleados` (
  `Empleados_ID` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Rol` enum('admin','empleado') DEFAULT 'empleado',
  `Password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empleados`
--

INSERT INTO `empleados` (`Empleados_ID`, `Username`, `Rol`, `Password`) VALUES
(9, 'Jona', 'admin', '$2b$10$7ISQkWNg2UWQcdVcuMyjwOaWrsR1QgS8rfoB9nRqI7IC3ai8kili2'),
(10, 'Javi', 'empleado', '$2b$10$QLZ2Ix40odMtWxKIUAuyTeWkB8ljsbERWvOJb4joRneN0s2P09uue');

--
-- Disparadores `empleados`
--
DELIMITER $$
CREATE TRIGGER `duplicado_Usuarios` BEFORE INSERT ON `empleados` FOR EACH ROW BEGIN
    -- Verifica si el nombre (Username) ya existe en la base de datos
    IF EXISTS (SELECT 1 FROM empleados WHERE Username = NEW.Username) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El nombre de usuario ya existe.';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `set_default_role_empleado` BEFORE INSERT ON `empleados` FOR EACH ROW BEGIN
    -- Si no se especifica un rol, lo establece como 'empleado' por defecto
    IF NEW.Rol IS NULL THEN
        SET NEW.Rol = 'empleado';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados_citas`
--

CREATE TABLE `empleados_citas` (
  `Empleados_ID` int(11) NOT NULL,
  `Cita_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empleados_citas`
--

INSERT INTO `empleados_citas` (`Empleados_ID`, `Cita_ID`) VALUES
(9, 51),
(9, 55),
(9, 57),
(9, 60),
(9, 61),
(9, 65),
(9, 66),
(9, 73),
(10, 62),
(10, 67);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `Servicio_ID` int(11) NOT NULL,
  `Nombre` varchar(50) DEFAULT NULL,
  `Descripcion` varchar(255) DEFAULT NULL,
  `Costo` decimal(10,2) DEFAULT NULL,
  `activo` enum('si','no') NOT NULL DEFAULT 'si'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`Servicio_ID`, `Nombre`, `Descripcion`, `Costo`, `activo`) VALUES
(1, 'Lavado', 'Lavado dental', 250.00, 'si'),
(8, 'Brackets', 'Colocacion de Brackets', 1501.00, 'si'),
(9, 'Prueba', 'probando', 6001.00, 'si'),
(20, 'Probando', 'Prueba', 33.00, 'no');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `citas`
--
ALTER TABLE `citas`
  ADD PRIMARY KEY (`Cita_ID`),
  ADD KEY `Cliente_ID` (`Cliente_ID`),
  ADD KEY `Servicio_ID` (`Servicio_ID`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`Cliente_ID`);

--
-- Indices de la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD PRIMARY KEY (`Empleados_ID`);

--
-- Indices de la tabla `empleados_citas`
--
ALTER TABLE `empleados_citas`
  ADD PRIMARY KEY (`Empleados_ID`,`Cita_ID`),
  ADD KEY `Cita_ID` (`Cita_ID`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`Servicio_ID`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `citas`
--
ALTER TABLE `citas`
  MODIFY `Cita_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `Cliente_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `Empleados_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `Servicio_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `citas`
--
ALTER TABLE `citas`
  ADD CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`Cliente_ID`) REFERENCES `clientes` (`Cliente_ID`),
  ADD CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`Servicio_ID`) REFERENCES `servicios` (`Servicio_ID`);

--
-- Filtros para la tabla `empleados_citas`
--
ALTER TABLE `empleados_citas`
  ADD CONSTRAINT `empleados_citas_ibfk_1` FOREIGN KEY (`Empleados_ID`) REFERENCES `empleados` (`Empleados_ID`),
  ADD CONSTRAINT `empleados_citas_ibfk_2` FOREIGN KEY (`Cita_ID`) REFERENCES `citas` (`Cita_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
