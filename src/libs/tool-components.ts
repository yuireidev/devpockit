// Dynamic component loader for static export compatibility
export const getToolComponent = async (componentName: string) => {
  const componentMap: Record<string, () => Promise<any>> = {
    'LoremIpsumGenerator': () => import('@/components/tools/LoremIpsumGenerator').then(m => m.LoremIpsumGenerator),
    'JsonFormatter': () => import('@/components/tools/JsonFormatter').then(m => m.JsonFormatter),
    'XmlFormatter': () => import('@/components/tools/XmlFormatter').then(m => m.XmlFormatter),
    'SqlFormatter': () => import('@/components/tools/SqlFormatter').then(m => m.SqlFormatter),
    'UuidGenerator': () => import('@/components/tools/UuidGenerator').then(m => m.UuidGenerator),
    'QrCodeGenerator': () => import('@/components/tools/QrCodeGenerator').then(m => m.QrCodeGenerator),
    'QrCodeDecoder': () => import('@/components/tools/QrCodeDecoder').then(m => m.QrCodeDecoder),
    'QrCodeScanner': () => import('@/components/tools/QrCodeScanner').then(m => m.QrCodeScanner),
    'UrlEncoderTool': () => import('@/components/tools/UrlEncoderTool').then(m => m.UrlEncoderTool),
    'UrlDecoderTool': () => import('@/components/tools/UrlDecoderTool').then(m => m.UrlDecoderTool),
    'DataFormatConverter': () => import('@/components/tools/DataFormatConverter').then(m => m.DataFormatConverter),
    'CidrAnalyzer': () => import('@/components/tools/CidrAnalyzer').then(m => m.CidrAnalyzer),
    'IpToCidrConverter': () => import('@/components/tools/IpToCidrConverter').then(m => m.IpToCidrConverter),
    'IpChecker': () => import('@/components/tools/IpChecker').then(m => m.IpChecker),
    'DiffChecker': () => import('@/components/tools/DiffChecker').then(m => m.DiffChecker),
    'TimestampConverter': () => import('@/components/tools/TimestampConverter').then(m => m.TimestampConverter),
    'ListComparison': () => import('@/components/tools/ListComparison').then(m => m.ListComparison),
    'ListConverter': () => import('@/components/tools/ListConverter').then(m => m.ListConverter),
    'JsonPathFinder': () => import('@/components/tools/JsonPathFinder').then(m => m.JsonPathFinder),
    'XmlPathFinder': () => import('@/components/tools/XmlPathFinder').then(m => m.XmlPathFinder),
    'YamlPathFinder': () => import('@/components/tools/YamlPathFinder').then(m => m.YamlPathFinder),
    'JsonSchemaGenerator': () => import('@/components/tools/JsonSchemaGenerator').then(m => m.JsonSchemaGenerator),
    'SchemaConverter': () => import('@/components/tools/SchemaConverter').then(m => m.SchemaConverter),
    'CronParser': () => import('@/components/tools/CronParser').then(m => m.CronParser),
    'JwtDecoder': () => import('@/components/tools/JwtDecoder').then(m => m.JwtDecoder),
    'JwtEncoder': () => import('@/components/tools/JwtEncoder').then(m => m.JwtEncoder),
    'RegexTester': () => import('@/components/tools/RegexTester').then(m => m.RegexTester),
    'SystemInfo': () => import('@/components/tools/SystemInfo').then(m => m.SystemInfo),
    'NumberBaseConverter': () => import('@/components/tools/NumberBaseConverter').then(m => m.NumberBaseConverter),
    'BaseEncoder': () => import('@/components/tools/BaseEncoder').then(m => m.BaseEncoder),
    'HashGenerator': () => import('@/components/tools/HashGenerator').then(m => m.HashGenerator),
  };

  const loader = componentMap[componentName];
  if (!loader) {
    throw new Error(`Component ${componentName} not found`);
  }

  return await loader();
};
