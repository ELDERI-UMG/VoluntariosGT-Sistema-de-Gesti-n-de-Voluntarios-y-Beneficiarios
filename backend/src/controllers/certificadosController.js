import { supabase } from '../config.js';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

/**
 * Genera un certificado en PDF
 */
export const generarCertificadoPDF = async (req, res) => {
  try {
    const { certificadoId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    // Obtener datos del certificado
    const { data: certificado, error } = await supabase
      .from('certificados')
      .select(`
        *,
        actividades (
          titulo,
          categoria,
          fecha_inicio,
          fecha_fin,
          entidades (
            nombre_organizacion,
            tipo_organizacion
          )
        ),
        perfiles (
          nombre_completo,
          dpi
        )
      `)
      .eq('id', certificadoId)
      .eq('voluntario_id', userId)
      .single();

    if (error || !certificado) {
      return res.status(404).json({
        error: 'Certificado no encontrado'
      });
    }

    // Crear PDF
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Configurar fuentes y colores
    const primaryColor = [26, 188, 156]; // Turquesa #1ABC9C
    const darkColor = [44, 62, 80]; // Gris oscuro #2C3E50
    const lightGray = [236, 240, 241]; // Gris claro

    // Fondo decorativo
    doc.setFillColor(...lightGray);
    doc.rect(0, 0, 297, 210, 'F');

    // Borde principal
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(3);
    doc.rect(10, 10, 277, 190);

    // Borde interno
    doc.setDrawColor(...darkColor);
    doc.setLineWidth(1);
    doc.rect(15, 15, 267, 180);

    // Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(...primaryColor);
    doc.text('CERTIFICADO DE PARTICIPACIÓN', 148.5, 40, { align: 'center' });

    // Línea decorativa
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(2);
    doc.line(50, 50, 247, 50);

    // Texto "Se certifica que"
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(...darkColor);
    doc.text('Se certifica que', 148.5, 70, { align: 'center' });

    // Nombre del voluntario
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text(certificado.perfiles.nombre_completo.toUpperCase(), 148.5, 85, { align: 'center' });

    // Texto de participación
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(...darkColor);
    doc.text('participó exitosamente en la actividad', 148.5, 100, { align: 'center' });

    // Nombre de la actividad
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...darkColor);
    
    // Dividir el título si es muy largo
    const tituloActividad = certificado.actividades.titulo;
    const maxWidth = 200;
    const tituloLineas = doc.splitTextToSize(tituloActividad, maxWidth);
    
    let yPosition = 115;
    tituloLineas.forEach(linea => {
      doc.text(linea, 148.5, yPosition, { align: 'center' });
      yPosition += 8;
    });

    // Información de la organización
    yPosition += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Organizada por: ${certificado.actividades.entidades.nombre_organizacion}`, 148.5, yPosition, { align: 'center' });

    // Fechas y horas
    yPosition += 8;
    const fechaInicio = new Date(certificado.actividades.fecha_inicio).toLocaleDateString('es-GT');
    const fechaFin = new Date(certificado.actividades.fecha_fin).toLocaleDateString('es-GT');
    doc.text(`Realizada del ${fechaInicio} al ${fechaFin}`, 148.5, yPosition, { align: 'center' });

    yPosition += 8;
    doc.text(`Horas certificadas: ${certificado.horas_certificadas}`, 148.5, yPosition, { align: 'center' });

    // Fecha de emisión
    yPosition += 15;
    const fechaEmision = new Date(certificado.fecha_emision).toLocaleDateString('es-GT');
    doc.text(`Emitido el ${fechaEmision}`, 148.5, yPosition, { align: 'center' });

    // Número de certificado
    yPosition += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Certificado No. ${certificado.numero_certificado}`, 148.5, yPosition, { align: 'center' });

    // Generar código QR
    try {
      const qrData = `https://voluntarios-app.com/verificar/${certificado.numero_certificado}`;
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 80,
        margin: 1,
        color: {
          dark: '#2C3E50',
          light: '#FFFFFF'
        }
      });

      // Agregar QR al PDF
      doc.addImage(qrCodeDataURL, 'PNG', 25, 160, 25, 25);
      
      // Texto del QR
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Escanea para verificar', 37.5, 190, { align: 'center' });
    } catch (qrError) {
      console.error('Error al generar QR:', qrError);
    }

    // Firma digital (texto)
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    doc.text('Sistema de Gestión de Voluntarios', 247, 175, { align: 'right' });
    doc.text('Guatemala', 247, 185, { align: 'right' });

    // Generar buffer del PDF
    const pdfBuffer = doc.output('arraybuffer');

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificado-${certificado.numero_certificado}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.byteLength);

    // Enviar PDF
    res.send(Buffer.from(pdfBuffer));

  } catch (error) {
    console.error('Error al generar certificado PDF:', error);
    res.status(500).json({
      error: 'Error al generar el certificado'
    });
  }
};

/**
 * Valida un certificado por su número
 */
export const validarCertificado = async (req, res) => {
  try {
    const { numeroCertificado } = req.params;

    if (!numeroCertificado) {
      return res.status(400).json({
        error: 'Número de certificado requerido'
      });
    }

    const { data: certificado, error } = await supabase
      .from('certificados')
      .select(`
        *,
        actividades (
          titulo,
          categoria,
          fecha_inicio,
          fecha_fin,
          entidades (
            nombre_organizacion,
            tipo_organizacion
          )
        ),
        perfiles (
          nombre_completo
        )
      `)
      .eq('numero_certificado', numeroCertificado)
      .eq('validado', true)
      .single();

    if (error || !certificado) {
      return res.status(404).json({
        error: 'Certificado no encontrado o no válido',
        valido: false
      });
    }

    res.json({
      valido: true,
      certificado: {
        numero_certificado: certificado.numero_certificado,
        fecha_emision: certificado.fecha_emision,
        horas_certificadas: certificado.horas_certificadas,
        voluntario: certificado.perfiles.nombre_completo,
        actividad: {
          titulo: certificado.actividades.titulo,
          categoria: certificado.actividades.categoria,
          fecha_inicio: certificado.actividades.fecha_inicio,
          fecha_fin: certificado.actividades.fecha_fin,
          organizacion: certificado.actividades.entidades.nombre_organizacion,
          tipo_organizacion: certificado.actividades.entidades.tipo_organizacion
        }
      }
    });

  } catch (error) {
    console.error('Error al validar certificado:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene estadísticas de certificados del usuario
 */
export const getEstadisticasCertificados = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    // Obtener estadísticas básicas
    const { data: estadisticas, error } = await supabase
      .from('certificados')
      .select('horas_certificadas, fecha_emision, actividades(categoria)')
      .eq('voluntario_id', userId);

    if (error) {
      console.error('Error al obtener estadísticas:', error);
      return res.status(500).json({
        error: 'Error al obtener estadísticas'
      });
    }

    const certificados = estadisticas || [];

    // Calcular estadísticas
    const totalCertificados = certificados.length;
    const totalHoras = certificados.reduce((sum, cert) => sum + (cert.horas_certificadas || 0), 0);
    
    // Agrupar por categoría
    const porCategoria = certificados.reduce((acc, cert) => {
      const categoria = cert.actividades?.categoria || 'Sin categoría';
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {});

    // Agrupar por año
    const porAno = certificados.reduce((acc, cert) => {
      const ano = new Date(cert.fecha_emision).getFullYear();
      acc[ano] = (acc[ano] || 0) + 1;
      return acc;
    }, {});

    res.json({
      estadisticas: {
        total_certificados: totalCertificados,
        total_horas: totalHoras,
        promedio_horas: totalCertificados > 0 ? (totalHoras / totalCertificados).toFixed(2) : 0,
        por_categoria: porCategoria,
        por_ano: porAno
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de certificados:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

export default {
  generarCertificadoPDF,
  validarCertificado,
  getEstadisticasCertificados
};

