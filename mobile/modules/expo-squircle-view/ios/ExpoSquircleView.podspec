Pod::Spec.new do |s|
  s.name           = 'ExpoSquircleView'
  s.version        = '0.1.0'
  s.summary        = 'Continuous-corner rounded rectangle drawn on a CAShapeLayer'
  s.description    = 'Continuous-corner rounded rectangle drawn on a CAShapeLayer'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '16.4',
    :tvos => '16.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
  s.exclude_files = "Tests/**/*"
end
