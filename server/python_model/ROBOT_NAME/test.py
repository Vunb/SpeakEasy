import tensorflow as tf

learning_rate = tf.Variable(float(123), trainable=False)

print 'hi!'

print str(learning_rate)
